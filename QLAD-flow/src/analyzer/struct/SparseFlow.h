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

#include <iostream>
#include <vector>
#include <cassert>
#include <stdint.h>
#include <time.h>

/*!
 * @headerfile SparseFlow.h "SparseFlow.h"
 * @brief Sparse time series storage class.
 *
 * Stores flows (number of packets for each second) in a sparse vector. Using
 * a sparse vector makes adding flows to sketches faster, assuming most flows
 * are sparse indeed.
 */
class SparseFlow
{
public:
	/*! @brief Sparse vector. */
	typedef ::std::vector< ::std::pair< time_t, uint32_t > > TimeSeries;
	/*! @brief Reexport standard const_iterator. */
	typedef TimeSeries::const_iterator const_iterator;

	/*! @brief Constructs empty Flow. */
	SparseFlow() : mCount( 0 ) {}

	/*!
	 * @brief Adds a point to the Flow.
	 * @param point Time position of the point to add.
	 *
	 * If this isn't the first time a point is inserted, its time has to
	 * be later or equal to the last point stored. If this can't be
	 * guaranteed, sparse vector will no longer be faster.
	 */
	void addPoint( const time_t point );

	/*!
	 * @brief Deletes all points before a specified time.
	 * @param time The specified time.
	 *
	 * This does not guarantee time == startTime(), and emptiness must be
	 * checked afterwards.
	 */
	void deleteBefore( const time_t time );

	/*! @brief Clears all stored data. */
	void clear();

	/*! @brief Number of points stored. */
	unsigned count() const
		{ return mCount; }

	/*! @brief Number of elements the stored time window needs. */
	size_t size() const {
		return endTime() - startTime() + 1;
	}

	/*!
	 * @brief Test for emptiness.
	 * @return true, if there are any stored points, false otherwise.
	 */
	bool empty() const
		{ return mSeries.empty(); }

	/*!
	 * @brief Returns const iterator pointing to the first element.
	 * @return SparseFlow::const_iterator pointing to the first element.
	 */
	const_iterator begin() const
		{ return mSeries.begin(); }

	/*!
	 * @brief Returns const iterator pointing behind the last element.
	 * @return SparseFlow::const_iterator pointing behind the last element.
	 */
	const_iterator end() const
		{ return mSeries.end(); }

	/*!
	 * @brief Time of the first stored point.
	 * Don't call this if empty.
	 */
	time_t startTime() const {
		assert( !mSeries.empty() );
		return mSeries.front().first;
	}

	/*!
	 * @brief Time of the last stored point.
	 * Don't call this if empty.
	 */
	time_t endTime() const {
		assert( !mSeries.empty() );
		return mSeries.back().first;
	}

        /*!
         * @brief Writes points of flow in gnuplot-format
         *
         * Writes flow as gnuplot-format "time_point count" into stream.
         *
         * @param stream output stream
         */
	void plot( ::std::ostream &stream ) const;

private:
	unsigned mCount;    /*!< @brief Number of time points in the SparseFlow. */
	TimeSeries mSeries; /*!< @brief Sparse vector storing the time points. */
};

/*!
 * @brief std::ostream operator for formatted output.
 * @param stream Output stream
 * @param flow SparseFlow to print
 * @return std::ostream used
 *
 * Outputs string: "Packets %number first %timestamp\n" and flushes ostream;
 */
::std::ostream & operator << ( ::std::ostream &stream, const SparseFlow &flow );


