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

#include "IPv4Address.h"
#include "IPv6Address.h"

/*!
 * @brief Hash functions namespace.
 */
namespace Hash
{
	/*!
	 * @brief Wraps several hashing functions on 4 byte data.
	 * @param index Hash function to use (0 - 31)
	 * @param address 4-byte data to hash
	 */
	unsigned short hashIPv4Address( unsigned index, IPv4Address address );

	/*!
	 * @brief Wraps several hashing functions on 16 byte data.
	 * @param index Hash function to use (0 - 15)
	 * @param address 16-byte data to hash
	 */
	unsigned short hashIPv6Address( unsigned index, const IPv6Address &address );
}
