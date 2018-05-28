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

#include "ReadWriteLock.h"

/*!
 * @class ReadLocker ReadLocker.h "sync/ReadLocker.h"
 * @brief Simple class to help with Read-Write locking.
 */
class ReadLocker
{
public:
	/*! @brief Locks and stores the provided ReadWriteLock. */
	ReadLocker( ReadWriteLock &lock ): mLock( lock )
		{ mLock.readLock(); }

	/*! @brief Unlocks the stored ReadWriteLock. */
	~ReadLocker()
		{ mLock.unlock(); }

protected:
	/*! @brief DO NOT COPY! */
	ReadLocker( const ReadLocker & );

	/*! @brief DO NOT COPY! */
	ReadLocker & operator = ( const ReadLocker & );

	/*! @brief Create ONLY on stack. */
	void * operator new ( size_t size );

	ReadWriteLock &mLock;  /*!< @brief ReadWriteLock to handle. */
};
