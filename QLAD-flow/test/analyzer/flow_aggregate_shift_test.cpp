#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "Flow.h"
#include "Flow.cpp"
//#include <statistics/statistics.cpp>

#include <sstream>

#include <ctime>
#include <cstdlib>
#include <iostream>
#include <string>

enum { POINTS_COUNT = 50000, WINDOW_SIZE = 300, LATER = 300 };

int main( int argc, char** argv )
{
	::std::cout << "---------- " << *argv << " start ----------\n";
	Flow a1,a2(2),a4(4);

	const time_t now = time( NULL );

	assert( time );

	a1.addPoint( now );

	for (unsigned i = 1; i < POINTS_COUNT; ++i) {
		const time_t point = now + rand() % WINDOW_SIZE;
		a1.addPoint( point );
	}

	a1.addPoint( now + LATER );
	a2.addPoint( now + LATER );
	a4.addPoint( now + LATER );
	for (unsigned i = 1; i < POINTS_COUNT; ++i) {
		const time_t point = now + LATER + rand() % WINDOW_SIZE;
		a1.addPoint( point );
		a2.addPoint( point );
		a4.addPoint( point );
	}

	a1.setStartTime( now + LATER );

	::std::stringstream a2plot, a4plot, agg2plot, agg4plot, agg4bplot;
	a1.aggregate(2).plot( agg2plot );
	a1.aggregate(4).plot( agg4plot );
	a2.plot( a2plot );
	a2.aggregate(4).plot( agg4bplot );
	a4.plot( a4plot );

	int ret = 0;

	if ( agg2plot.str() == a2plot.str() ) {
		::std::cout << "TEST PASSED! Shifted aggregation: 1->2\n";
	} else {
		::std::cout << "TEST FAILED! Shifted aggregation: 1->2\n";
		++ret;
	}

	if ( agg4plot.str() == a4plot.str() ) {
		::std::cout << "TEST PASSED! Shifted aggregation: 1->4\n";
	} else {
		::std::cout << "TEST FAILED! Shifted aggregation: 1->4\n";
		++ret;
	}

	if ( agg4bplot.str() != a4plot.str() ) {
		::std::cout << "TEST FAILED! Shifted aggregation: 2->4\n";
		++ret;
	} else {
		::std::cout << "TEST PASSED! Shifted aggregation: 2->4\n";
	}

	::std::cout << "---------- " << *argv << " end ----------\n";
	return ret;
}
