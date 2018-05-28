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

#include <vector>

#include "proc/Thread.h"
#include "sync/ReadLocker.h"
#include "sync/ReadWriteLock.h"
#include "sync/WriteLocker.h"

/*!
 * @class SafeGrowTable SafeGrowTable.h "struct/SafeGrowTable.h"
 * @brief Thread-safe index table.
 * @tparam T type of stored elements
 *
 * Table is safe in terms of index access, i.e. elements will not
 * move in the middle of read or write. Table is only able to grow,
 * thus it is user's responsibility to provide valid index.
 * Content of elements not protected and it is left for the user to
 * implement any additional synchronization.
 */
template<typename T>
class SafeGrowTable
{
public:
	/*! @brief Constructs empty table and initialize lock. */
	SafeGrowTable() {}

	/*!
	 * @brief Gets stored value.
	 * @param index Index of the value to get.
	 * @return Stored value.
	 *
	 * As the table's interface provides only a way to enlarge table,
	 * it is user's responsibility to make sure the index is valid.
	 */
	T read( unsigned index ) const
	{
		ReadLocker lock( mGuard );
		assert( index < mStore.size() );
		return mStore.at(index);
	}

	/*!
	 * @brief Stores a new value.
	 * @param index Index of the value to overwrite.
	 * @param value Value to insert.
	 *
	 * As the table's interface provides only a way to enlarge table,
	 * it is user's responsibility to make sure the index is valid.
	 */
	void write( unsigned index, const T& value )
	{
		ReadLocker lock( mGuard );
		assert( index < mStore.size() );
		mStore[index] = value;
	}

	/*!
	 * @brief Makes sure the table is big enough.
	 * @param new_size requested size of the table.
	 * @return Original size of the table
	 *
	 * @note Actual resize will happen only if the table is smaller
	 * than requested.
	 */
	size_t grow( size_t new_size )
	{
		WriteLocker lock( mGuard );
		size_t old_size = mStore.size();
		if (new_size > old_size)
			{ mStore.resize( new_size ); }
		return old_size;
	}

	/*!
	 * @brief Gets actual size of the table.
	 * @return Size of the table
	 *
	 * @note The value may be invalid at the moment of return
	 * from this function. Use with care. As the table never shrinks,
	 * it is safe to access index below the value of size().
	 */
	size_t size() const
		{ return mStore.size(); }

protected:
	/*! @brief DO NOT COPY! */
	SafeGrowTable( const SafeGrowTable & );
	/*! @brief DO NOT COPY! */
	SafeGrowTable & operator = ( const SafeGrowTable & );

	/*! @brief Storage place for elements. */
	::std::vector<T> mStore;
	/*! @brief Lock to provide thread-safety. */
	mutable ReadWriteLock mGuard;
};
