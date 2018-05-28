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

/*!
 * @class ReadWriteLock ReadWriteLock.h "sync/ReadWriteLock.h"
 * @brief POSIX mutex wrapper class
 *
 * @see man pthread.h
 */
class ReadWriteLock
{
public:
	/*! @brief Constructs POSIX rwlock using default parameters. */
	ReadWriteLock()
	{
		const int ret = pthread_rwlock_init( &mGuard, NULL );
		assert( ret == 0 ); (void) ret;
	}
	/*! @brief Safely destroys the internal POSIX rwlock */
	~ReadWriteLock()
		{ pthread_rwlock_destroy( &mGuard ); }

	/*! @brief Atomically locks or block until it can be locked for writing. */
	void writeLock()
		{ pthread_rwlock_wrlock( &mGuard ); }
	/*! @brief Atomically locks or block until it can be locked for reading. */
	void readLock()
		{ pthread_rwlock_rdlock( &mGuard ); }

	/*! @brief Tries to lock for reading, but does not block. */
	bool tryReadLock()
		{ return pthread_rwlock_tryrdlock( &mGuard ); }
	/*! @brief Tries to lock for writing, but does not block. */
	bool tryWriteLock()
		{ return pthread_rwlock_trywrlock( &mGuard ); }

	/*! @brief Unlocks the lock, whether it was locked for reading or writing */
	void unlock()
		{ pthread_rwlock_unlock( &mGuard ); }

protected:
	/*! @brief POSIX rwlock to wrap. */
	pthread_rwlock_t mGuard;

	/*! @brief DO NOT COPY. Destruction won't work. */
	ReadWriteLock( const ReadWriteLock & );
	/*! @brief DO NOT COPY. Destruction won't work. */
	ReadWriteLock & operator = ( const ReadWriteLock & );
};
