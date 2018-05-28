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

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "SparseFlow.h"


void SparseFlow::addPoint( const time_t point )
{
    // ignore out-of-order packets
    if ( !mSeries.empty() && mSeries.back().first > point ) return;

    if ( mSeries.empty() || mSeries.back().first != point )
            mSeries.push_back( ::std::make_pair( point, 1 ) );
    else
            ++mSeries.back().second;

    ++mCount;
}

void SparseFlow::deleteBefore( const time_t time ) {
    /* If time is later than our last point, just erase and don't
     * do the expensive mCount adjustment. */
    if ( mSeries.empty() || mSeries.back().first < time )
            return clear();

    TimeSeries::iterator i = mSeries.begin();

    /* Find the first element not to be deleted and adjust mCount
     * along the way. */
    for ( ; i != mSeries.end() && i->first < time; ++i )
            mCount -= i->second;

    mSeries.erase( mSeries.begin(), i );
}

void SparseFlow::clear() {
    mSeries.clear();
    mCount = 0;
}

void SparseFlow::plot( ::std::ostream &stream ) const
{
    TimeSeries::const_iterator it = mSeries.begin();
    for (;it != mSeries.end(); ++it) {
            stream << it->first << " " << it->second << "\n";
    }
    stream << ::std::endl;
}

::std::ostream & operator << ( ::std::ostream &stream, const SparseFlow &flow ) {
    if ( flow.empty() )
        stream << "Packets: 0" << ::std::endl;
    else {
        const time_t start_time = flow.startTime();
        stream << "Packets: " << flow.count() << "(" << flow.size() << ")"
               << " first: " << ctime( &start_time ) << ::std::endl;
    }

    return stream;
}


