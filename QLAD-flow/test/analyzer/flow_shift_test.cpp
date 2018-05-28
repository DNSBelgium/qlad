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
#include <fstream>
#include <string>

enum { POINTS_COUNT = 50000, WINDOW_SIZE = 300, LATER = 300 };

int main( int argc, char** argv )
{
	::std::cout << "---------- " << *argv << " start ----------\n";

	Flow a,b;
	const time_t now = time( NULL );

	assert( time );

	a.addPoint( now );

	for (unsigned i = 1; i < POINTS_COUNT; ++i) {
		const time_t point = now + rand() % WINDOW_SIZE;
		a.addPoint( point );
	}

	a.addPoint( now + LATER );
	b.addPoint( now + LATER );
	for (unsigned i = 1; i < POINTS_COUNT; ++i) {
		const time_t point = now + LATER + rand() % WINDOW_SIZE;
		a.addPoint( point );
		b.addPoint( point );
	}
	a.setStartTime( now + LATER );

	::std::stringstream aplot, bplot;
	a.plot( aplot );
	b.plot( bplot );

	int ret = 0;

	if ( a.count() == b.count() ) {
		::std::cout << "TEST PASSED! Shift count test.\n";
	} else {
		::std::cout << "TEST FAILED! Shift count test: " << a.count() << " vs. "
			<< b.count() << "\n";
		++ret;
	}

	if ( aplot.str() == bplot.str() ) {
		::std::cout << "TEST PASSED! Shift test.\n";
	} else {
		::std::cout << "TEST FAILED! Shifted start time: " << a.startTime() << " vs. "
			<< b.startTime() << "\n";
		::std::ofstream fa("FAILED-"__FILE__"-FlowA.plot" );
		::std::ofstream fb("FAILED-"__FILE__"-FlowB.plot" );
		a.plot( fa );
		fa.close();
		b.plot( fb );
		fb.close();
		++ret;
	}

	b.setStartTime( now + LATER + WINDOW_SIZE ); //should make this Flow empty()
	if ( b.empty() ) {
		::std::cout << "TEST PASSED! Shift empty test.\n";
	} else {
		::std::cout << "TEST FAILED! Shift empty test.\n";
		++ret;
	}

	::std::cout << "---------- " << *argv << " end ----------\n";
	return ret;
}
