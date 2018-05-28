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
#include <deque>

#include "struct/SparseFlow.h"
#include "struct/TimeSeries.h"

/*!
 * @class Sketch Sketch.h "Sketch.h"
 * @brief Flow aggregation class.
 * @tparam ID Type of identifiers used to identify flows.
 *
 * Merges multiple @link Flow Flows @endlink into one time series. Stores
 * identifiers of all merged @link Flow Flows @endlink.
 */
template<typename ID>
class Sketch
{
public:
	/*! @brief Exports structure used for time storage */
	typedef TimeSeries TTimeSeries;
	/*! @brief Exports structure used for ID storage */
	typedef ::std::deque<ID> IdSet;

	/*!
	 * @brief Constructs Sketch and prepares underlying storage for data
	 * @param start_time Lower limit for stored time points (!= 0)
	 * @param size Expected time span(!= 0)
	 */
	Sketch( time_t start_time, size_t size )
	  : mSeries( start_time, size )
		{ assert( start_time ); assert( size ); }

	/*!
	 * @brief Adds Flow to the aggregated traffic.
	 * @param id Identifier of the Flow that is to be added
	 * @param flow A Flow to add
	 *
	 * This function expects the merged Flow to start later than the Sketch,
	 * and its time series to be shorter.
	 *
	 * It is also assumed that identifiers come in ascending order. This
	 * fact is used to speed up the assert-check that each id is inserted
	 * only once, and to speed up computation of unions of IDs in Engine
	 * and Detector.
	 */
	void addFlow( const ID &id, const SparseFlow &flow );

	/*!
	 * @brief Accesses stored identifiers.
	 * @return Identifiers of the merged @link Flow Flows@endlink
	 */
	const IdSet & identifiers() const
		{ return mIdentifiers; }

	/*!
	 * @brief Accesses stored time points.
	 * @return Data points of the merged @link Flow Flows@endlink
	 */
	const TTimeSeries & series() const
		{ return mSeries; }

protected:
	/*! @brief Time points storage place */
	TTimeSeries mSeries;
	/*! @brief Identifiers of the aggregated @link Flow Flows@endlink */
	IdSet mIdentifiers;
};
/* -------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* -------------------------------------------------------------------------- */
/*!
 * @brief ::std::ostream operator for formatted output.
 * @param stream Output stream
 * @param sketch Sketch to print
 * @return ::std::ostream used
 *
 * Outputs string: "Sketch size: %size IDs( %id_count ) ", where %size is
 * the number of seconds stored, and %id_count is the number of
 * @link Flow Flows @endlink merged in the Sketch. List of all IDs
 * follow if PRINT_SKETCH_IDS macro is defined.
 */
template<typename ID>
::std::ostream & operator << ( ::std::ostream &stream, const Sketch<ID> &sketch )
{
	const typename Sketch<ID>::IdSet &identifiers = sketch.getIdentifiers();

	stream << " Sketch size " << sketch.series().size()
	  << " IDs(" << identifiers.size() << ") ";

#ifdef PRINT_SKETCH_IDS
	typedef typename Sketch<ID>::IdSet::const_iterator iterator;
	for (iterator it = identifiers.begin(); it != identifiers.end(); ++it)
		{ stream << *it << ", "; }
#endif
	return stream;
}
/* -------------------------------------------------------------------------- */
template<typename ID>
void Sketch<ID>::addFlow( const ID &id, const SparseFlow &other )
{
	assert( other.startTime() >= mSeries.startTime() );
	assert( other.endTime() >= other.startTime() );
	assert( (unsigned) (other.endTime() - mSeries.startTime()) < mSeries.size() );
	assert( mIdentifiers.empty() || mIdentifiers.back() < id );

	mIdentifiers.push_back( id );


	for ( SparseFlow::const_iterator it = other.begin(); it != other.end(); ++it )
		mSeries[ it->first - mSeries.startTime() ] += it->second;
}
