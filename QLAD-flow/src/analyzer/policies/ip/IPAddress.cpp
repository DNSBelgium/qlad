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
#include <cstring>
#include <cstdlib>
#include <iostream>

#include "IPAddress.h"
#include "iphash.h"

::std::ostream & operator << (
  ::std::ostream &stream, const IPAddress &address )
{
	switch (address.mFamily) {
		case IPAddress::IPv4: {
			const IPv4Address bytes = address.mIPv4Address;
			stream << ((bytes >> 24) & 0xff) << ".";
			stream << ((bytes >> 16) & 0xff) << ".";
			stream << ((bytes >>  8) & 0xff) << ".";
			stream << ((bytes >>  0) & 0xff);
			break;
		}
		case IPAddress::IPv6: {
			static const char hex[] =
			  { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
			  'a', 'b', 'c', 'd', 'e', 'f' };

			const unsigned char *bytes = address.mIPv6Address;

			stream << hex[bytes[0] >> 4] << hex[bytes[0] & 0xf];
			stream << hex[bytes[1] >> 4] << hex[bytes[1] & 0xf];

			for (unsigned i = 1; i < (sizeof(IPv6Address) / 2); ++i) {
				stream << ":"
				  << hex[bytes[2 * i] >> 4]
				  << hex[bytes[2 * i] & 0xf]
				  << hex[bytes[2 * i + 1] >> 4]
				  << hex[bytes[2 * i + 1] & 0xf]
				  ;
			}
			break;
		}
		default:
			assert(!"Invalid IP address");
			std::cerr << "Invalid IP address\n";
			exit(1);
	}
	return stream;
}
/* -------------------------------------------------------------------------- */
bool operator < ( const IPAddress &left, const IPAddress &right )
{
	switch (left.mFamily) {
		case IPAddress::IPv4:
			return (right.mFamily != IPAddress::IPv4)
			  || (left.mIPv4Address < right.mIPv4Address);
		case IPAddress::IPv6:
			return (right.mFamily == IPAddress::IPv6) &&
			  (memcmp(left.mIPv6Address, right.mIPv6Address, sizeof( IPv6Address ))
			  < 0);
		default:
			assert(!"Invalid IP address");
			std::cerr << "Invaid IP address\n";
			exit(1);
	}
}
/* -------------------------------------------------------------------------- */
bool operator == ( const IPAddress &left, const IPAddress &right )
{
	switch (left.mFamily) {
		case IPAddress::IPv4:
			return (right.mFamily == IPAddress::IPv4)
			  && (left.mIPv4Address == right.mIPv4Address);
		case IPAddress::IPv6:
			return (right.mFamily == IPAddress::IPv6) &&
			  (memcmp(left.mIPv6Address, right.mIPv6Address, sizeof( IPv6Address ))
			  == 0);
		default:
			assert(!"Invalid IP address");
			std::cerr << "Invaid IP address\n";
			exit(1);
	}
}
/* -------------------------------------------------------------------------- */
unsigned IPAddress::hash( unsigned index ) const
{
	switch (mFamily) {
		case IPAddress::IPv4:
			return Hash::hashIPv4Address( index, mIPv4Address );
		case IPAddress::IPv6:
			return Hash::hashIPv6Address( index, mIPv6Address );
		default:
			assert(!"Invalid IP address");
			std::cerr << "Invaid IP address\n";
			exit(1);
	}
}
