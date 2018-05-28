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

#pragma once

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <ostream>
#include <cstring>

#include "IPv4Address.h"
#include "IPv6Address.h"

/* Forward declarations */
class IPAddress;

/*!
 * @brief ::std::ostream operator for formatted output.
 * @param stream Output stream.
 * @param address IP address to print
 * @return ::std::ostream used
 *
 * Prints IP address in a human readable form.
 */
::std::ostream & operator << ( ::std::ostream &stream, const IPAddress &address );

/*!
 * @brief Standard comparator, works only for the addresses of the same family.
 * @param left Left operand
 * @param right Right operand
 * @return true, if addresses are of the same family and left is < right,
 * otherwise false.
 */
bool operator < ( const IPAddress &left, const IPAddress &right );

/*!
 * @brief Standard comparator, works only for the addresses of the same family.
 * @param left Left operand
 * @param right Right operand
 * @return true, if addresses are of the same family and equal, otherwise false.
 */
bool operator == ( const IPAddress &left, const IPAddress &right );

/*!
 * @class IPAddress IPAddress.h "policies/IPAddress.h"
 * @brief IP address storage and manipulation class.
 *
 * Stores both IPv4 and IPv6 addresses.
 */
class IPAddress
{
public:
	/*! @brief Address type */
	enum AddressFamily { IPv4, IPv6 };

	/*!
	 * @brief Conversion constructor from the IPv4Address type
	 * @param ipv4 Address to convert.
	 */
	IPAddress( const IPv4Address ipv4 )
	: mFamily( IPv4 ), mIPv4Address( ipv4 ) {};

	/*!
	 * @brief Conversion constructor from the IPv6Address type
	 * @param ipv6 Address to convert.
	 */
	IPAddress( const IPv6Address ipv6 ): mFamily( IPv6 )
		{ memcpy( mIPv6Address, ipv6, sizeof( IPv6Address ) ); }

	/*!
	 * @brief Conversion assignment from the IPv4Address type
	 * @param ipv4 Address to convert.
	 * @return Self reference
	 */
	IPAddress & operator = ( const IPv4Address ipv4 )
		{ mFamily = IPv4; mIPv4Address = ipv4; return *this; }

	/*!
	 * @brief Conversion assignment from the IPv6Address type
	 * @param ipv6 Address to convert.
	 * @return Self reference
	 */
	IPAddress & operator = ( const IPv6Address ipv6 )
	{
		mFamily = IPv6;
		memcpy( mIPv6Address, ipv6, sizeof( IPv6Address ) );
		return *this;
	}

	/*!
	 * @brief Computes hash using the requested function.
	 * @param index Function to use.
	 * @return Computed hash value.
	 */
	unsigned hash( unsigned index = 0 ) const;

protected:
	AddressFamily mFamily; /*!< @brief Type of the stored address. */
	union {
		IPv4Address mIPv4Address; /*!< @brief The IPv4 address, if used */
		IPv6Address mIPv6Address; /*!< @brief The IPv6 address, if used */
	};

	friend ::std::ostream & operator << (
	  ::std::ostream &stream, const IPAddress &address );
	friend bool operator < ( const IPAddress &left, const IPAddress &right );
	friend bool operator == ( const IPAddress &left, const IPAddress &right );
};
