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

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <cassert>
#include <netinet/ip.h>
#include <netinet/ip6.h>
#include <stdint.h>
#include <cstdlib>
#include <iostream>

#include "policies/IPPolicy.h"
#include "IPv4Address.h"
#include "iphash.h"

/*! @brief Convenience typedef from netinet/ip.h */
typedef struct iphdr ip4_header;
/*! @brief Convenience typedef from netinet/ip6.h */
typedef struct ip6_hdr ip6_header;

const char *SrcIPPolicy::NAME = "Source IP Policy";
const char *DstIPPolicy::NAME = "Destination IP Policy";

template<typename T>
inline unsigned hash_wrapper( const unsigned index, const T &id )
	{ return id.hash( index ); }
/* -------------------------------------------------------------------------- */
template<>
inline unsigned hash_wrapper <IPv4Address> (
  const unsigned index, const IPv4Address &id )
	{ return Hash::hashIPv4Address( index, id ); }
/* -------------------------------------------------------------------------- */
SrcIPPolicy::id_t SrcIPPolicy::parseIdentifier( const char *data, const size_t length )
{
	assert( length > sizeof(ip4_header) ); (void) length;

	const ip4_header *header = reinterpret_cast<const ip4_header *>( data );

	switch( header->version)
	{
		case 4:
			return ntohl( header->saddr );
#ifndef NO_IPV6
		case 6:
			assert( length > sizeof(ip6_header) );
			return reinterpret_cast<const ip6_header *>( data )
			  ->ip6_src.s6_addr;
#endif
		default:
			assert( !"Invalid IP Protocol version" );
			std::cerr << "Invalid IP Protocol version\n";
			exit(1);
	}
}
/* -------------------------------------------------------------------------- */
unsigned SrcIPPolicy::hash( const unsigned index, const id_t &id )
	{ return hash_wrapper( index, id ); }
/* -------------------------------------------------------------------------- */
DstIPPolicy::id_t DstIPPolicy::parseIdentifier( const char *data, const size_t length )
{
	assert( length > sizeof(ip4_header) ); (void) length;

	const ip4_header *header = reinterpret_cast<const ip4_header *>( data );

	switch( header->version) {
		case 4:
			return ntohl( header->daddr );
#ifndef NO_IPV6
		case 6:
			assert( length > sizeof(ip6_header) );
			return reinterpret_cast<const ip6_header *>( data )
			  ->ip6_dst.s6_addr;
#endif
		default:
			assert( !"Invalid IP Protocol version" );
			std::cerr << "Invalid IP Protocol version\n";
			exit(1);
	}
}
/* -------------------------------------------------------------------------- */
unsigned DstIPPolicy::hash( const unsigned index, const id_t &id )
	{ return hash_wrapper( index, id ); }
