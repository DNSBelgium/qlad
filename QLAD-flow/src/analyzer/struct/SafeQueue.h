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

#include <ctime>
#include <queue>
#include <string>
#include <utility>

#include "sync/Mutex.h"
#include "sync/MutexLocker.h"
#include "sync/WaitCondition.h"

/*!
 * @class SafeQueue SafeQueue.h "struct/SafeQueue.h"
 * @brief ::std::queue guarded by Mutex.
 */
template<typename T>
class SafeQueue
{
public:
	/*!
	 * @brief Add element to the queue
	 * @param element This will be added.
	 */
	void push( const T &element )
	{
		MutexLocker m( mGuard );
		mQueue.push( element );
	}

	/*!
	 * @brief Get element count.
	 * @return Number of elements in the queue.
	 */
	unsigned size()
	{
		MutexLocker m( mGuard );
		return mQueue.size();
	}

	/*!
	 * @brief Get an element, if there is one.
	 * @param invalid Value to return if there is nothing in the queue.
	 * @return Success indicator paired with an element.
	 *
	 * Success indicator is false if the queue is empty, in that case element
	 * contains value specified by the parameter.
	 */
	::std::pair<bool, T> pop( const T &invalid = T() );

protected:
	Mutex mGuard;           /*!< @brief Mutex to prevent simultaneous access. */
	::std::queue<T> mQueue; /*!< @brief Storage place for elements. */
};
/* -------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* -------------------------------------------------------------------------- */
template<typename T>
::std::pair<bool, T> SafeQueue<T>::pop( const T &invalid )
{
	MutexLocker m( mGuard );
	if (mQueue.empty())
		{ return ::std::make_pair( false, invalid ); }
	::std::pair<bool, T> ret = ::std::make_pair( true, mQueue.front() );
	mQueue.pop();
	return ret;
}
