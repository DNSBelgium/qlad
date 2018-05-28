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

#include <cstdlib>
#include <limits.h>
#include <stdint.h>
#include <cassert>
#include <sys/time.h>

/*!
 * @class RNG RNG.h "hash/RNG.h"
 * @brief Simple reentrant (as opposed to rand from stdlib) random generator.
 */
class RNG {
public:
	/*! @brief Construct a new generator with unique seed. */
	RNG() {
		struct timeval t;
		int ret = gettimeofday( &t, NULL );
		assert( ret == 0 ); (void) ret;
		seed( (uint64_t) t.tv_sec * t.tv_usec );
	}

	/*! @brief Construct a new generator with a given seed. */
	RNG( uint64_t s )
		{ seed( s ); }

	/*! @brief Seed an existing generator with a new seed. */
	void seed( uint64_t s ) {
		mSeed[0] = ( s >> 0  ) ^ ( s >> 48 );
		mSeed[1] = ( s >> 16 ) ^ ( s >> 48 );
		mSeed[2] = ( s >> 32 ) ^ ( s >> 48 );
	}

	uint32_t gen_u32()
		{ return ::jrand48( mSeed ); }

	uint64_t gen_u64()
		{ return gen_u32() | (uint64_t) gen_u32() << 32; }

	double gen_double()
		{ return ::erand48( mSeed ); }

private:
	/*! @brief The RNG state. */
	unsigned short mSeed[3];
};

/*!
 * @brief A template for RNG wrapper functors which provide operator ()
 * returning a specified type.
 */
template < typename Ret, Ret (RNG::*Fun)() >
struct _RNGFun : RNG {
	_RNGFun() : RNG() {}
	_RNGFun( uint64_t s ) : RNG( s ) {}
	Ret operator () () {
		return (this->*Fun)();
	}
};

/* Definition of the RNG wrapper functors for the three types supported by
 * RNG. */
typedef _RNGFun< uint32_t, &RNG::gen_u32 > RNGFunU32;
typedef _RNGFun< uint64_t, &RNG::gen_u64 > RNGFunU64;
typedef _RNGFun< double, &RNG::gen_double > RNGFunDouble;
