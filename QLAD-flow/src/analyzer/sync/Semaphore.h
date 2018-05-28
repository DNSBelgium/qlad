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

#include <semaphore.h>

/*!
 * @class Semaphore Semaphore.h "sync/Semaphore.h"
 * @brief POSIX semaphore wrapper class.
 */
class Semaphore
{
public:
	/*!
	 * @brief Creates POSIX semaphore with base value of 'value'.
	 * @param value Initial value to be set.
	 */
	inline Semaphore( unsigned value = 0 );

	/*! @brief Safely destroys wrapped POSIX semaphore. */
	~Semaphore()
		{ sem_destroy( &mGuard ); }

	/*!
	 * @brief Increases the value of the semaphore.
	 *
	 * If the new value is 1, a thread waiting on the semaphore will be woken.
	 */
	void up()
		{ sem_post( &mGuard ); }

	/*! @brief Decrements the value of the semaphore, blocks on zero. */
	void down()
		{ sem_wait( &mGuard ); }

	/*!
	 * @brief Reads the value of the semaphore.
	 * @note The value might have already changed by the time this function
	 * returns.
	 */
	int value()
		{ int val; sem_getvalue( &mGuard, &val ); return val; }

protected:
	/*! @brief DO NOT COPY. Destruction won't work. */
	Semaphore( const Semaphore & );

	/*! @brief DO NOT COPY. Destruction won't work. */
	Semaphore & operator = ( const Semaphore & );

	sem_t mGuard; /*!< @brief POSIX semaphore to wrap. */
};
/* -------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* -------------------------------------------------------------------------- */
Semaphore::Semaphore( unsigned value )
{
	const int ret = sem_init( &mGuard, 0, value );
	assert( ret == 0 ); (void) ret;
}
