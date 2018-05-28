/*
 * This file is part of the DNS traffic analyser project.
 *
 * Copyright (C) 2011 CZ.NIC, z.s.p.o.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// NOTICE: this is a modified version of https://github.com/SIDN/entrada
// modified 2017-08-18 by Pieter Robberechts in context of implementing QLAD system at DNS Belgium
// use SLD instead of full qname as hash key

#pragma once

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

//#define PACKET_DEBUG

#ifdef PACKET_DEBUG
#include <iostream>
#include <sstream>
#endif
#include <string>
#include <vector>
#include <cassert>

/*!
 * @headerfile PacketParser.h "policies/dns/PacketParser.h"
 * @brief A functor that parses DNS query names out of an IP packet.
 *
 * Note: The sole reason for this being a functor instead of a function is the
 * syntactic sugar for bounds checking and error reporting. Also, it may be
 * somewhat easier for the compiler to perform Return Value Optimization,
 * although I'm afraid it's not that smart.
 */
class PacketParser {
public:
	PacketParser() {}

	/*!
	 * @brief Parse a packet.
	 * @param bp Packet data (aligned to at least 2 bytes).
	 * @param length Packet size.
	 * @return DNS query name or an empty string for invalid packets.
	 */
	::std::string operator ()( const unsigned char *bp, unsigned length )
	{
#ifdef PACKET_DEBUG
		++seq;
#endif

		/* bp should be aligned */
		assert( (intptr_t) bp % 2 == 0 );

		mSnapend = bp + length;
		mName.clear();
		mFailed = false;
		parseIp( (const struct ip *) bp );

		if ( mFailed || mName.size() == 0 ) {
#ifdef PACKET_DEBUG
			/* seq number the same as in wireshark */
			::std::cerr << seq << ": " << mError.str();
			if ( mError.tellp() == 0 )
				::std::cerr << ::std::endl;
#endif
			mName.clear();
		}

		return getSLD(mName);
	}

	enum {
		MAXDNAME = 256 /*!< @brief Max name length (RFC 883) */
	};

  ::std::string getSLD(::std::string mName) {
    std::string hostName = mName;
    std::string serverDomainStr;
    int cpos = hostName.rfind(".");
    if(cpos != std::string::npos) {
      serverDomainStr = hostName.substr(0, cpos);
    } else {
      serverDomainStr = hostName.substr(0);
    }

    int pcpos = serverDomainStr.rfind(".");
    if(pcpos != std::string::npos) {
      serverDomainStr = hostName.substr(0, pcpos);
    } else {
      serverDomainStr = hostName.substr(0);
    }

    int ppcpos = serverDomainStr.rfind(".");
    if(ppcpos != std::string::npos) {
      serverDomainStr = hostName.substr(0, ppcpos);
    } else {
      serverDomainStr = hostName.substr(0);
    }

    hostName = hostName.substr(ppcpos+1);
    return hostName;
  }

private:
	const unsigned char *mSnapend; /*!< @brief Ptr to end of packet. */
	::std::string mName;          /*!< @brief Buffer for query name. */
	bool mFailed;                 /*!< @brief Failed flag. */
#ifdef PACKET_DEBUG
	static int seq; /*!< @brief Packet number (same as in wireshark). */
	::std::ostringstream mError; /*!< @brief Parse error explanation. */
#endif

	/*!
	 * @brief Set the failed flag and append an error explanation.
	 * @param err Error explanation.
	 */
	void fail( const ::std::string &err = "" ) {
		mFailed = 1;
#ifdef PACKET_DEBUG
		mError << err << ::std::endl;
#else
		(void) err; /* get rid of warning: unused parameter `err' */
#endif
	}

	void parseIp( const struct ip *ip );          /*!< @brief Parse IP packet. */
#ifndef NO_IPV6
	void parseIp6( const struct ip6_hdr *ip6 );   /*!< @brief Parse IPv6 packet. */
#endif
	void parseUdp( const struct udphdr *up );     /*!< @brief Parse UDP payload. */
	void parseDns( const struct ns_header *np );  /*!< @brief Parse DNS payload. */
	void parseDnsName( const unsigned char *cp ); /*!< @brief Parse query name. */
};
