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

#include "Mutex.h"

/*!
 * @class MutexLocker MutexLocker.h "sync/MutexLocker.h"
 * @brief Simple class to help with Mutex locking.
 */
class MutexLocker
{
public:
	/*! @brief Locks and stores the provided Mutex. */
	MutexLocker( Mutex &mutex ): mMutex( mutex )
		{ mMutex.lock(); }

	/*! @brief Unlocks the stored Mutex. */
	~MutexLocker()
		{ mMutex.unlock(); }

protected:
	/*! @brief DO NOT COPY! */
	MutexLocker( const MutexLocker & );

	/*! @brief DO NOT COPY! */
	MutexLocker & operator = ( const MutexLocker & );

	/*! @brief Create ONLY on stack. */
	void * operator new ( size_t size );

	Mutex &mMutex;  /*!< @brief Mutex to handle. */
};
