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
#include <ctime>

#include <algorithm>
#include <iostream>
#include <vector>

/*!
 * @class TimeSeries TimeSeries "struct/TimeSeries.h"
 * @brief TimeSeries storage class.
 *
 * The class keeps directly accessible vector of time points,
 * time of the first stored point, and aggregation used to store the points.
 * @note As the used vector is directly accessible, users of this class need
 * to watch and respect used aggregation when inserting additional points.
 */
class TimeSeries:
  public ::std::vector<unsigned>
{
public:
	/*! @brief Convenience typedef */
	typedef unsigned STORAGE_TYPE;

	/*!
	 * @brief Constructs a TimeSeries instance using the provided values.
	 * @param start_time Lower time limit for stored points.
	 * @param size Initial size of the underlying vector.
	 * @param aggregation Time aggregation to use
	 *
	 * Neither start_time, nor aggregation are enforced by any of
	 * the member functions. User of this structure is responsible for that.
	 */
	TimeSeries( time_t start_time, size_t size = 0, unsigned aggregation = 1 )
	  : ::std::vector<STORAGE_TYPE>( size ), mStartTime( start_time ),
		  mAggregation( aggregation ) {};

	/*!
	 * @brief Gets stored start time.
	 * @return Value of mAggregation member variable.
	 * Start time is specified in constructor.
	 */
	time_t startTime() const
		{ return mStartTime; }

	/*!
	 * @brief Gets stored aggregation.
	 * @return Value of mAggregation member variable.
	 * Aggregation is specified in constructor.
	 */
	unsigned aggregation() const
		{ return mAggregation; }

	/*!
	 * @brief Swaps data in TimeSeries.
	 * @param other Swapping partner
	 *
	 * Function uses provided ::std swap functions on its data members
	 */
	void swap( TimeSeries &other )
	{
		::std::vector<STORAGE_TYPE>::swap( other );
		::std::swap( mStartTime, other.mStartTime );
		::std::swap( mAggregation, other.mAggregation );
	}

	/*!
	 * @brief Outputs raw data.
	 * @param stream Place to output the data to.
	 *
	 * Data are written in two columns, time and number of packets received
	 * at that time. Useful for combination with gnuplot.
	 */
	void plot( ::std::ostream &stream ) const;

	/*!
	 * @brief Creates a copy using the specified aggregation.
	 * @param agg Aggregation to use.
	 * @return New TimeSeries with the same data and different aggregation.
	 *
	 * The instance is used a as a source of data.
	 * @see TimeSeries( const TimeSeries &other, unsigned agg );
	 */
	TimeSeries aggregate( unsigned agg ) const
		{ return TimeSeries( *this, agg ); }

protected:
	/*!
	 * @brief Creates a copy using the specified aggregation.
	 * @param agg Aggregation to use.
	 * @param other source of data.
	 */
	TimeSeries( const TimeSeries &other, unsigned agg );

	/*!
	 * @brief Beginning of the stored series
	 * Only constructors, swap(), and operator = () modify this value.
	 */
	time_t mStartTime;

	/*!
	 * @brief Number of seconds worth of data in one element
	 * Only constructors, swap(), and operator = () modify this value.
	 */
	unsigned mAggregation;
};
