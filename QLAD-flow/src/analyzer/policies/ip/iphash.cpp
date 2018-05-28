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

#include "iphash.h"
#include "hash/UniversalHashSystem.h"


unsigned short Hash::hashIPv4Address( unsigned index, IPv4Address address )
{
	static UniversalHashSystem<IPv4Address, unsigned short> hasher;
	return hasher( index, address );
}
/* -------------------------------------------------------------------------- */
unsigned short Hash::hashIPv6Address(
  const unsigned index, const IPv6Address &address )
{
	static UniversalHashSystem<IPv6Address, unsigned short> hasher;
	return hasher( index, address );
}
