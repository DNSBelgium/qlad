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
#include "MutexLocker.h"
#include "WaitCondition.h"

/*!
 * @class Signaler Signaler.h "sync/Signaler.h"
 * @brief Simple wait-for-signal class
 */
class Signaler
{
public:
	/*!
	 * @brief Initializes status of the Signaler.
	 * @param status Value to use for initialization.
	 */
	Signaler( bool status = false ): mStatus( status ) {}

	/*! @brief Wake all waiting threads before destruction. */
	~Signaler()
		{ signal(); }

	/*!
	 * @brief Set a new value, wake threads on true.
	 * @param status New value to set.
	 * @return Self reference.
	 */
	Signaler & operator = ( bool status );

	/*!
	 * @brief Convenience operator.
	 * @see isSignal()
	 */
	operator bool () const
		{ return isSignal(); }

	/*! @brief Reads current status. */
	bool isSignal() const
		{ return mStatus; };

	/*! @brief Blocks until the status is true. */
	void waitSignal() const
		{ MutexLocker lock( mGuard ); if (!mStatus) { mWait.wait( mGuard ); } };

	/*! @brief Set status to true and wakes all waiting threads. */
	void signal()
		{ MutexLocker lock( mGuard ); mStatus = true; mWait.broadcast(); }

protected:
	mutable Mutex mGuard;  /*!< @brief Mutex to use for atomic check and wait. */
	mutable WaitCondition mWait; /*!< @brief Block on and signal changes. */

	volatile bool mStatus; /*!< @brief current status indicator. */
};
/* -------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* -------------------------------------------------------------------------- */
Signaler & Signaler::operator = ( bool status )
{
	MutexLocker lock( mGuard );
	if ((mStatus = status))
		{ mWait.broadcast(); }
	return *this;
}
