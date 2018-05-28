#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "Flow.h"
#include "Flow.cpp"
#include "Sketch.h"
//#include <statistics/statistics.cpp>

#include <sstream>

#include <ctime>
#include <cstdlib>
#include <iostream>
#include <fstream>
#include <string>

enum { POINTS_COUNT = 50000, WINDOW_SIZE = 300, LATER = 50 };

int main( int argc, char** argv )
{
	::std::cout << "---------- " << *argv << " start ----------\n";

	Flow a1,a2,b1,b2,all;

	const time_t now = time( NULL );

	assert( time );

	all.addPoint( now );
	a1.addPoint( now );
	a2.addPoint( now );
	all.addPoint( now + LATER );
	b1.addPoint( now + LATER );
	b2.addPoint( now + LATER );

	for (unsigned i = 1; i < POINTS_COUNT; ++i) {
		const time_t point = now + rand() % WINDOW_SIZE;
		a1.addPoint( point );
		a2.addPoint( point );
		all.addPoint( point );
	}

	for (unsigned i = 1; i < POINTS_COUNT; ++i) {
		const time_t point = now + LATER + rand() % WINDOW_SIZE;
		b1.addPoint( point );
		b2.addPoint( point );
		all.addPoint( point );
	}

	::std::stringstream a1plot, a2plot, b1plot, b2plot;
	a1.plot( a1plot );
	a2.plot( a2plot );

	if ( a1plot.str() != a2plot.str() ) {
		::std::cerr << "Something has gone terribly wrong a1 and a2 differ.\n";
		return 1;
	}

	b1.plot( b1plot );
	b2.plot( b2plot );

	if ( b1plot.str() != b2plot.str() ) {
		::std::cerr << "Something has gone terribly wrong b1 and b2 differ.\n";
		return 1;
	}

	Sketch< ::std::string > s1,s2;

	s1.setStartTime( now );
	s1.setSize( LATER + WINDOW_SIZE );
	s2.setStartTime( now );
	s2.setSize( LATER + WINDOW_SIZE );

	s1.addFlow( "a1", a1 );
	s1.addFlow( "b1", b1 );

	s2.addFlow( "b2", b2 );
	s2.addFlow( "a2", a2 );

	::std::stringstream merged_to_older, merged_to_younger, not_merged;
	s1.plot( merged_to_older );
	s2.plot( merged_to_younger );
	all.plot( not_merged );

	int ret = 0;

	if (merged_to_older.str() == merged_to_younger.str()) {
		::std::cout << "TEST PASSED! Merge results are the same.\n";
	} else {
		::std::cout << "TEST FAILED! Merge results differ.\n";
		++ret;
	}

	if (merged_to_older.str() == not_merged.str()) {
		::std::cout << "TEST PASSED! Merge to older is correct.\n";
	} else {
		::std::cout << "TEST FAILED! Merge to older differs from expected result.\n";
		::std::ofstream fa("FAILED-"__FILE__"-FlowOlder.plot" );
		::std::ofstream fb("FAILED-"__FILE__"-FlowExpected.plot" );
		a1.plot( fa );
		fa.close();
		all.plot( fb );
		fb.close();
		++ret;
	}

	if (merged_to_younger.str() == not_merged.str()) {
		::std::cout << "TEST PASSED! Merge to younger is correct.\n";
	} else {
		::std::cout << "TEST FAILED! Merge to younger differs from expected result.\n";
		++ret;
	}

	::std::cout << "---------- " << *argv << " end ----------\n";
	return ret;
}
