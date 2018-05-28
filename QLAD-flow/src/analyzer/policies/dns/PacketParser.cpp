/*
 * This code was originally taken from tcpdump 4.1.1 and heavily modified for
 * DNS Anomaly detector. The original license text follows:
 */

/*
 * Copyright (c) 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997
 * The Regents of the University of California.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that: (1) source code distributions
 * retain the above copyright notice and this paragraph in its entirety, (2)
 * distributions including binary code include the above copyright notice and
 * this paragraph in its entirety in the documentation or other materials
 * provided with the distribution, and (3) all advertising materials mentioning
 * features or use of this software display the following acknowledgement:
 * ``This product includes software developed by the University of California,
 * Lawrence Berkeley Laboratory and its contributors.'' Neither the name of
 * the University nor the names of its contributors may be used to endorse
 * or promote products derived from this software without specific prior
 * written permission.
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "PacketParser.h"

#include <cstring>
#include <algorithm>
#include <stdint.h>
#include <arpa/inet.h>

/* IPv4/6 headers */
#include <netinet/ip.h>
#ifndef NO_IPV6
# include <netinet/ip6.h>
#endif

/* UDP headers */
#include <netinet/udp.h>
/* This may be useful for BSD compatibility later. */
#ifndef __FAVOR_BSD
# define uh_sport source
# define uh_dport dest
# define uh_ulen len
# define uh_sum check
#endif

/* DNS headers */
#include "nameser.h"


/*
 * True if "l" bytes of "var" were captured.
 *
 * The "snapend - (l) <= snapend" checks to make sure "l" isn't so large
 * that "snapend - (l)" underflows.
 *
 * The check is for <= rather than < because "l" might be 0.
 */
#define TTEST2(var, l) (mSnapend - (l) <= mSnapend && \
			(const unsigned char *)&(var) <= mSnapend - (l))

/* Fail if "l" bytes of "var" were not captured. */
#define TCHECK2( var, l, str ) \
	do { if ( !TTEST2( var, l ) ) { fail( str ); return; } } while (0)

/* Fail if "var" was not captured. */
#define TCHECK( var, str ) \
	do { if ( !TTEST2( var, sizeof( var ) ) ) { fail( str ); return; } } while (0)

/* Fail if test is true. */
#define FAIL_IF( test, str ) \
	do { if ( test ) { fail( str ); return; } } while (0)

#define BYTEOFF(type, ptr, off) ((type) ((char *) (ptr) + (off)))


#ifdef PACKET_DEBUG
int PacketParser::seq = 0;
#endif

/*
 * print an IP datagram.
 */
void PacketParser::parseIp( const struct ip *ip )
{
	TCHECK( *ip, "IP header truncated" );

	/* Is this an IPv4 or IPv6 packet? */
	switch ( ip->ip_v ) {
	case 4:
		break;
#ifndef NO_IPV6
	case 6:
		parseIp6( (const struct ip6_hdr *) ip);
		return;
#endif
	default:
		FAIL_IF( true, "unknown ip version (not an IP header?)" );
	}

	/* Read and check header and packet length. */
	unsigned hlen = ip->ip_hl * 4,
		 len = ntohs( ip->ip_len );
	FAIL_IF( hlen < sizeof( *ip ) || len < hlen, "bad headerlen" );

	TCHECK2( *ip, len, "packet truncated" );

	/* Cut off the snapshot length to the end of the IP payload. */
	mSnapend = ::std::min( mSnapend, BYTEOFF( const unsigned char *, ip, len ) );

	unsigned off = ntohs( ip->ip_off );
	FAIL_IF( (off & IP_OFFMASK) || (off & IP_MF), "fragmentation not supported" );

	FAIL_IF( ip->ip_p != IPPROTO_UDP, "not a UDP packet" );

	parseUdp( BYTEOFF( const struct udphdr *, ip, hlen ) );
}

#ifndef NO_IPV6
/*
 * print an IP6 datagram.
 */
void PacketParser::parseIp6( const struct ip6_hdr *ip6 )
{
	TCHECK( *ip6, "IPv6 header truncated" );

	/* Read and check payload length. */
	unsigned len = ntohs( ip6->ip6_plen ) + sizeof( *ip6 );
	TCHECK2( *ip6, len, "packet truncated" );

	/* Cut off the snapshot length to the end of the IP payload. */
	mSnapend = ::std::min( mSnapend, BYTEOFF( const unsigned char *, ip6, len ) );

	/* Find the UDP payload. */
	const struct ip6_ext *eh = (const struct ip6_ext *) (ip6 + 1);
	int nh = ip6->ip6_nxt;
	for ( ;; ) {
		switch (nh) {
		case IPPROTO_HOPOPTS:
		case IPPROTO_DSTOPTS:
		case IPPROTO_ROUTING:
		case IPPROTO_AH:
		/* IPPROTO_MOB* not defined in netinet/in.h */
		//case IPPROTO_MOBILITY_OLD:
		//case IPPROTO_MOBILITY:
			TCHECK( *eh, "exthdr truncated/corrupted" );

			nh = eh->ip6e_nxt;
			eh = BYTEOFF( const struct ip6_ext *, eh,
					((unsigned) eh->ip6e_len + 1) * 8 );
			break;
		case IPPROTO_FRAGMENT:
			FAIL_IF( true, "fragmentation not supported" );
		case IPPROTO_UDP:
			return parseUdp( (const struct udphdr *) eh );
		default:
			FAIL_IF( true, "not a UDP packet or unrecognized IPv6 header" );
		}
	}

	// not reached
}
#endif

void PacketParser::parseUdp( const struct udphdr *up )
{
	TCHECK( *up, "UDP header truncated" );

	uint16_t sport = ntohs( up->uh_sport ),
		 dport = ntohs( up->uh_dport );
	FAIL_IF( dport != NAMESERVER_PORT && sport != NAMESERVER_PORT,
			"not a DNS packet" );

	parseDns( (const struct ns_header *) (up + 1) );
}

void PacketParser::parseDns( const struct ns_header *np )
{
	TCHECK( *np, "dns header truncated" );

	uint16_t qdcount = ntohs( np->qdcount );
	FAIL_IF( DNS_QR( np ) || DNS_OPCODE( np ) != QUERY || qdcount == 0,
			"not a query" );
	FAIL_IF( ntohs( ((uint16_t *) np)[1] ) & 0x6cf,
			"weird query flags" );

	/* Extract first query name. See git history for the code dealing with
	 * extracting all questions, if that is ever needed. */
	parseDnsName( (const unsigned char *) (np + 1) );

#ifdef PACKET_DEBUG
	/* Warn if there are more questions. */
	if ( qdcount > 1 ) {
		::std::cerr << seq << ": " << qdcount << " queries" << ::std::endl;
	}
#endif
}

void PacketParser::parseDnsName( const unsigned char *cp )
{
	/* Avoid unnecessary allocations. */
	mName.reserve( MAXDNAME );

	unsigned l;
	do {
		TCHECK( *cp, "query name truncated" );
		l = *cp++;

		FAIL_IF( l & INDIR_MASK, "query name compression / EDNS bitlabel" );

		TCHECK2( *cp, l, "query name truncated" );
		::std::transform( cp, cp + l, ::std::back_inserter( mName ),
				/* Unambiguously select the one and only
				 * tolower function from ctype.h so that there
				 * is absolutely no chance that some other
				 * tolower from some strange namespace is
				 * selected at the most inconvenient moment.
				 */
				static_cast< int(*)(int) >( ::std::tolower ) );
		cp += l;

		/* Don't append a final dot if there already is one. */
		if ( !( l == 0 && mName.size() ) )
			mName.push_back( '.' );
	} while ( l );

	FAIL_IF( mName.length() > MAXDNAME, "query name too long" );
}
