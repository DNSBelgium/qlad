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

#include <vector>

#include "RNG.h"
#include "struct/RandomVectors.h"

/*!
 * @class UniversalHashSystem UniversalHashSystem.h "hash/UniversalHashSystem.h"
 * @brief Universal hashing system.
 * @tparam KEY_TYPE Type of keys to hash.
 * @tparam HASH_TYPE Hash value to generate.
 *
 * Implemented algorithm:
 * Universal Classes of Hash Functions
 * J. Lawrence Carter and Mark N. Wegman
 * IBM Thomas J. Watson Research Center
 * Yorktown Heights, New York 10598
 *
 * Algorithm and proof that the system is universal is on the page 110
 * (page 5 in extended abstract), Proposition 6.
 */
template<typename KEY_TYPE, typename HASH_TYPE>
class UniversalHashSystem
{
public:
	/*!
	 * @brief Constructs table used for hash computing.
	 */
	UniversalHashSystem() {}

	/*!
	 * @brief Compute hash of the key, using function identified by index.
	 * @param index Hash function to use.
	 * @param key Key to hash.
	 * @return Computed hash of the key.
	 *
	 * Wrapper for the hash() member function.
	 */
	HASH_TYPE operator() ( unsigned index, const KEY_TYPE &key )
		{ return hash( index, key ); }

	/*!
	 * @brief Compute hash of the key, using function identified by index.
	 * @param index Hash function to use.
	 * @param key Key to hash.
	 * @return Computed hash of the key.
	 *
	 * Use generated table and algorithm described in
	 * Universal Classes of Hash Functions, to compute the result.
	 */
	HASH_TYPE hash( unsigned index, const KEY_TYPE &key );

protected:
	/*!
	 * @brief Table parameter.
	 *
	 * Base = 256(0x100) -- 1byte, length = number of bytes in KEY.
	 */
	enum { COLUMNS = 0x100 * sizeof(KEY_TYPE) };

	/*! @brief The table used for hash computing. */
	RandomVectors<HASH_TYPE, COLUMNS, RNGFunU32> mVectors;

};
/* -------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* -------------------------------------------------------------------------- */
template<typename KEY_TYPE, typename HASH_TYPE>
HASH_TYPE UniversalHashSystem<KEY_TYPE, HASH_TYPE>::hash(
  unsigned index, const KEY_TYPE &key )
{
	const HASH_TYPE *line = mVectors.get( index );

	HASH_TYPE result = 0;
	unsigned place = 0;
	/* cast of any pointer to char * does not brake any rules */
	const char *bytes = reinterpret_cast<const char*>( &key );

	for (unsigned i = 0; i < sizeof(KEY_TYPE); ++i) {
		place += static_cast<unsigned char>( bytes[i] ) + 1;
		result ^= line[place - 1];
	}
	return result;
}
/* -------------------------------------------------------------------------- */
