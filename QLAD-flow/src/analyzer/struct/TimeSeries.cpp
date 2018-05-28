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

#include "TimeSeries.h"

TimeSeries::TimeSeries( const TimeSeries &other, unsigned agg )
	: mStartTime( other.mStartTime ), mAggregation( agg )
{
	assert( agg >= other.aggregation() );
	assert( (agg % other.aggregation()) == 0 );

	if (agg == other.aggregation()) {
		assign( other.begin(), other.end() );
		return;
	}

	const unsigned ratio = agg / other.aggregation() ;
	assert( ratio );
	reserve( (other.size() + ratio) / ratio );

	for (const_iterator it = other.begin(); it != other.end();) {
		unsigned sum = 0;
		for ( unsigned i = 0; i < ratio && it != other.end(); ++i )
			{ sum += *it; ++it;	}
		push_back( sum );
	}
}
/* -------------------------------------------------------------------------- */
void TimeSeries::plot( ::std::ostream &stream ) const
{
	time_t time = mStartTime;
	for (const_iterator i = begin(); i != end(); ++i) {
		stream << time << " " << *i << "\n";
		time += mAggregation;
	}
	stream << ::std::endl;
}
