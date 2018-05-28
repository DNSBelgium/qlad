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

#include <cstring>
#include <stdint.h>
#include "RNG.h"
#include "struct/RandomVectors.h"

/* simple static assert */
template <bool cond, typename Desc> struct Guard { Guard(){} };
template <typename Desc> struct Guard<true, Desc> { Guard(){} };

/* error messages */
struct HASH_TYPE_larger_than_33_bits {};
struct MAX_LENGTH_has_to_be_even {};

/*!
 * @class UniversalVectorHash UniversalVectorHash.h "hash/UniversalVectorHash.h"
 * @brief Universal hashing system for vectors and strings of fixed maximum
 *        length.
 * @tparam FUNCTIONS Number of hash functions in the system.
 * @tparam HASH_TYPE Type of hash values. Must have <= 33 bits.
 * @tparam MAX_LENGTH Maximum length of a vector.
 *
 * Implemented algorithm:  Section 5.3 of
 *     Mikkel Thorup. 2009. String hashing for linear probing. In Proceedings
 *     of the twentieth Annual ACM-SIAM Symposium on Discrete Algorithms
 *     (SODA '09). Society for Industrial and Applied Mathematics,
 *     Philadelphia, PA, USA, 655-664.
 *     http://portal.acm.org/citation.cfm?id=1496842
 */
template < typename HASH_TYPE, size_t MAX_LENGTH >
class UniversalVectorHash
	: Guard< ( sizeof( HASH_TYPE ) * CHAR_BIT <= 33 ),
		 HASH_TYPE_larger_than_33_bits >
{
public:
	/*!
	 * @brief Compute hash of the key, using function identified by index.
	 * @param index Hash function to use.
	 * @param key Key to hash.
	 * @param len Length of key.
	 * @return Computed hash of the key.
	 *
	 * Wrapper for the hash() member function.
	 */
	HASH_TYPE operator() ( unsigned index, const char *key, unsigned len )
		{ return hash( index, key, len ); }

	/*!
	 * @brief Compute hash of the key, using function identified by index.
	 * @param index Hash function to use.
	 * @param key Key to hash.
	 * @param len Length of key.
	 * @return Computed hash of the key.
	 */
	HASH_TYPE hash( unsigned index, const char *key, unsigned len )
	{
		const uint64_t *line = mTable.get( index );
		uint64_t result = 0;

		assert( len <= MAX_LENGTH );
		for ( unsigned i = 0, j = 0; i < len;
				i += 2 * sizeof( uint32_t ), j += 2 ) {
			uint32_t x1 = get32( key, i,                      len ),
				 x2 = get32( key, i + sizeof( uint32_t ), len );
			result ^= ( x1 + line[ j     ] )
				* ( x2 + line[ j + 1 ] );
		}

		return result >> ( sizeof( uint64_t ) * CHAR_BIT
				 - sizeof( HASH_TYPE ) * CHAR_BIT );
	}

private:
	/*! @brief Load up to 32 bits from p + i.
	 *  @param p Start of the array.
	 *  @param i Index.
	 *  @param len Length of data in the array.
	 */
	static inline uint32_t get32( const char *p, unsigned i, unsigned len )
	{
		if ( i >= len )
			return 0;

		if ( i + sizeof( uint32_t ) <= len )
			return * (uint32_t *) (p + i);

		uint32_t ret = 0;
		memcpy( (char *) &ret, p + i, len - i );
		return ret;
	}

	/*! @brief Number of columns in the table.
	 * This is the smallest even number larger or equal to
	 * ceil( MAX_LENGTH / sizeof( uint32_t ) ).
	 */
	enum { COLUMNS = ( (MAX_LENGTH + sizeof( uint32_t ) - 1)
				/ sizeof( uint32_t ) + 1 ) & ~1 };

	/*! @brief The table used for hash computing. */
	RandomVectors< uint64_t, COLUMNS, RNGFunU64 > mTable;
};
