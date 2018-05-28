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

#include "Mutex.h"

/*!
 * @class WaitCondition WaitCondition.h "sync/WaitCondition.h"
 * @brief POSIX wait condition wrapper class
 */
class WaitCondition
{
public:
	/*! @brief Constructs pthread_cond using default parameters. */
	WaitCondition()
	{
		//Default pthread wait condition initialization
		const int ret = pthread_cond_init( &mCondition, NULL );
		assert( ret == 0 ); (void) ret;
	}

	/*! @brief Safely destroys pthread_cond. */
	~WaitCondition()
	{
		const int ret = pthread_cond_destroy( &mCondition );
		assert( ret == 0 ); (void) ret;
	}

	/*!
	 * @brief Atomically waits for signal, and unlocks Mutex.
	 * @param mutex Mutex to unlock.
	 */
	void wait( Mutex &mutex )
	{
		const int ret = pthread_cond_wait( &mCondition, &mutex.mGuard );
		assert( ret == 0 ); (void) ret;
	}

	/*! @brief Wakes one thread waiting for the signal. */
	void signal()
	{
		const int ret = pthread_cond_signal( &mCondition );
		assert( ret == 0 ); (void) ret;
	}

	/*! @brief Wakes all threads waiting for the signal. */
	void broadcast()
	{
		const int ret = pthread_cond_broadcast( &mCondition );
		assert( ret == 0 ); (void) ret;
	}

protected:
	pthread_cond_t mCondition;  /*!< @brief POSIX wait condition to wrap. */

private:
	/*! @brief DO NOT COPY. Destruction won't work. */
	WaitCondition( const WaitCondition & );

	/*! @brief DO NOT COPY. Destruction won't work. */
	WaitCondition & operator = ( const WaitCondition & );
};
