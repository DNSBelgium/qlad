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

#include "QueryNamePolicy.h"
#include "dns/PacketParser.h"
#include "hash/UniversalVectorHash.h"

const char *QueryNamePolicy::NAME = "Query Name Policy";

QueryNamePolicy::id_t
QueryNamePolicy::parseIdentifier( const char *data, const size_t length )
{
	return PacketParser()( (const u_char *) data, length );
}

unsigned QueryNamePolicy::hash( const unsigned index, const id_t &id )
{
	static UniversalVectorHash< uint8_t, PacketParser::MAXDNAME > hasher;
	return hasher( index, id.c_str(), id.length() );
}
