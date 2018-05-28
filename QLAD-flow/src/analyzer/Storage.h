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
#include <map>
#include <ostream>

#include "IStorage.h"
#include "struct/SparseFlow.h"

/*!
 * @class Storage Storage.h "Storage.h"
 * @brief Data storage class.
 * @tparam POLICY Identifiers used to identify flows and parsing function.
 *
 * Stores identifier traffic. Identifier type and parsing function is
 * provided by the POLICY class. Range startTime-endTime is inclusive,
 * i.e. there is a packet that arrived at endTime.
 */
template<typename POLICY>
class Storage:
	public IStorage,
	public ::std::map<typename POLICY::id_t, SparseFlow>
{
public:
	typedef Storage< POLICY > THIS;
	/*! @brief Convenience typedef, exports identifier type */
	typedef typename POLICY::id_t Identifier;

	/*! @brief Enable default constructor */
	Storage( size_t window_size )
	  : mWindowSize( window_size ), mStartTime( 0 ), mEndTime( 0 ) {}

	/*!
	 * @brief Plot new time-point using the packet data.
	 * @param data Packet data to parse.
	 * @param time Time point to plot.
	 *
	 * Parses POLICY::id_t type from the packet data and plot the
	 * time point in its respective data Flow.
	 */
	void addPacket( const PacketData &data, time_t time );

	/*!
	 * @brief Get the time of the beginning of the stored time window.
	 * @return Arrival time of the oldest packet.
	 */
	time_t startTime() const
		{ return mStartTime; }

	/*!
	 * @brief Get the time of the end of the stored time window.
	 * @return Arrival time of the last packet.
	 */
	time_t endTime() const
		{ return mEndTime; }

	/*!
	 * @brief Number of seconds in used time window.
	 * @return Size of the window specified at construction.
	 */
	unsigned windowSize() const
		{ return mEndTime - mStartTime + 1; }

	/*!
	 * @brief Sync data stored in flow with designated time window.
	 *
	 * Remove flows that are outside of the window. Shift the flows
	 * that started earlier than #mStartTime.
	 */
	void sync();

	const SparseFlow & allTraffic() const
		{ return mAllTraffic; }

protected:
	/*! @brief Maximum timespan of stored communication. */
	const size_t mWindowSize;

private:
	/*! @brief FORBIDDEN operator. */
	Storage & operator = ( const Storage & );

	time_t mStartTime; /*!< @brief Time stamp of the first stored
	                               packet. */
	time_t mEndTime;   /*!< @brief Time stamp of the last stored packet. */

	SparseFlow mAllTraffic;
};

/*!
 * @brief ::std::ostream operator for formatted output.
 * @param stream Output stream
 * @param storage Storage instance to print
 * @return ::std::ostream used
 *
 * Outputs string: "Storage(%n) from: %time, where %n is the number of
 * stored Flows, and %time is time stamp of the first stored packet.
 * Pairs of id and corresponding flow follow, printed as %id : %flow.
 */
template<typename POLICY>
::std::ostream & operator << ( ::std::ostream &stream,
                               Storage<POLICY> storage );
/* ------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Storage<POLICY>::addPacket( const PacketData &data, time_t time )
{
	const Identifier id =
	  POLICY::parseIdentifier( data.data(), data.size() );

	if (POLICY::isValid( id )) {
		/* update time window information */
		mEndTime = ::std::max( mEndTime, time );
		mStartTime =
		  ::std::max<time_t>( mStartTime, mEndTime - mWindowSize + 1 );

		/* find destination flow and add packet, shift if necessary */
		SparseFlow & destination = (*this)[id];
		destination.addPoint( time );
		if (destination.startTime() < mStartTime)
			{ destination.deleteBefore( mStartTime ); }
		mAllTraffic.addPoint( time );
	}
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Storage<POLICY>::sync()
{
	mAllTraffic.deleteBefore( mStartTime );
	typename THIS::iterator it;
	/* check all stored flows */
	for ( it = this->begin(); it != this->end(); ) {
		it->second.deleteBefore( mStartTime );

		/* drop flows that are empty in this time window */
		if ( it->second.empty() )
			this->erase( it++ );
		else
			++it;
	}
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
::std::ostream & operator << (
  ::std::ostream &stream, const Storage<POLICY> &storage )
{
	time_t time = storage.startTime();
	stream << "Storage (" << storage.size() << ") from: "
	  << ::std::ctime( &time );
	typename Storage<POLICY>::const_iterator it;
	for (it = storage.begin(); it != storage.end(); ++it)
		{ stream << "\t" << it->first << " : " << it->second; }
	return stream;
}
