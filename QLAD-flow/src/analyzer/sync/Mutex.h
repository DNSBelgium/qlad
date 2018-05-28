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

#include <cassert>
#include <pthread.h>

class WaitCondition;

/*!
 * @class Mutex Mutex.h "sync/Mutex.h"
 * @brief POSIX mutex wrapper class
 *
 * @see man pthread.h
 */
class Mutex
{
public:
	/*! @brief Constructs POSIX mutex using default parameters. */
	Mutex()
	{
		const int ret = pthread_mutex_init( &mGuard, NULL );
		assert( ret == 0 ); (void) ret;
	}

	/*! @brief Safely destroys the internal POSIX mutex. */
	~Mutex()
	{
		const int ret = pthread_mutex_destroy( &mGuard );
		assert( ret == 0); (void) ret;
	}

	/*! @brief Atomically locks or block until it can be locked. */
	void lock()
		{ pthread_mutex_lock( &mGuard ); }

	/*! @brief Unlocks and leaves Mutex to other threads. */
	void unlock()
		{ pthread_mutex_unlock( &mGuard ); }

	/*! @brief Tries to lock, but does not block. */
	bool trylock()
		{ return pthread_mutex_trylock( &mGuard ); }

protected:
	/*! @brief POSIX mutex to wrap. */
	pthread_mutex_t mGuard;

	/*! @brief DO NOT COPY. Destruction won't work. */
	Mutex( const Mutex & );

	/*! @brief DO NOT COPY. Destruction won't work. */
	Mutex & operator = ( const Mutex & );

	friend class WaitCondition;
};
