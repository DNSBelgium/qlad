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
 * @class WriteLocker WriteLocker.h "sync/WriteLocker.h"
 * @brief Simple class to help with Read-Write locking.
 */
class WriteLocker
{
public:
	/*! @brief Locks and stores the provided ReadWriteLock. */
	WriteLocker( ReadWriteLock &lock ): mLock( lock )
		{ mLock.writeLock(); }

	/*! @brief Unlocks the stored ReadWriteLock. */
	~WriteLocker()
		{ mLock.unlock(); }

protected:
	/*! @brief DO NOT COPY! */
	WriteLocker( const WriteLocker & );

	/*! @brief DO NOT COPY! */
	WriteLocker & operator = ( const WriteLocker & );

	/*! @brief Create ONLY on stack. */
	void * operator new ( size_t size );

	ReadWriteLock &mLock;  /*!< @brief ReadWriteLock to handle. */
};
