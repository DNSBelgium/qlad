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

#ifdef NO_IPV6
#include "ip/IPv4Address.h"
typedef IPv4Address IPAddress;   /*!< @brief IPv4 address type */
#else
#include "ip/IPAddress.h"
#endif

/*!
 * @struct SrcIPPolicy IPPolicy.h "policies/IPPolicy.h"
 * @brief Policy class around source IP address.
 *
 * Provides:
 *  - id_t type that stores IP address
 *  - parsing function parseIdentifier that creates id_t from packet data
 *  - hash functions for IP address
 *  - validity check for parsed identifiers
 */
struct SrcIPPolicy
{
	static const char *NAME; /*!< @brief Human readable name of the policy */
	typedef IPAddress id_t;  /*!< @brief Identified by IP address          */

	/*!
	 * @brief Parses packet for IPv4 or IPv6 source address.
	 * @param data Packet data
	 * @param size Packet size
	 * @return Source IP address of the packet
	 */
	static id_t parseIdentifier( const char *data, const size_t size );

	/*!
	 * @brief Various hash functions that use IP address
	 * @param index Hash function to use
	 * @param identifier Address that will be hashed.
	 * @return Hashed value of an IP address
	 * @note Implementation is shared with DstIPPolicy::hash().
	 */
	static unsigned hash( const unsigned index, const id_t &identifier );

	static bool isValid( const id_t & )
		{ return true; }
};

/*!
 * @struct DstIPPolicy IPPolicy.h "policies/IPPolicy.h"
 * @brief Policy class around destination IP address.
 *
 * Provides:
 *  - id_t type that stores IP address
 *  - parsing function parseIdentifier that creates id_t from packet data
 *  - hash functions for IP address
 *  - validity check for parsed identifiers
 */
struct DstIPPolicy
{
	static const char *NAME;   /*!< @brief Human readable name of the policy */
	typedef IPAddress id_t;    /*!< @brief Identified by IP address          */

	/*!
	 * @brief Parses packet for IPv4 or IPv6 destination address.
	 * @param data Packet data
	 * @param size Packet size
	 * @return Destination IP address of the packet
	 */
	static id_t parseIdentifier( const char *data, const size_t size );

	/*!
	 * @brief Various hash functions that use IP address
	 * @param index Hash function to use
	 * @param identifier Address that will be hashed.
	 * @return Hashed value of an IP address
	 * @note Implementation is shared with SrcIPPolicy::hash().
	 */
	static unsigned hash( const unsigned index, const id_t &identifier );

	static bool isValid( const id_t & )
		{ return true; }
};
