#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <iostream>
#include <iterator>
#include <algorithm>
#include <vector>
#include "test.h"
using namespace ::std;

#include "util/NSetsMerge.h"
#include "hash/RNG.h"

enum { TEST_RUNS = 1000 };

static RNG rnd;

/*! @brief An int pair for stability testing. */
struct int2 {
	int val, id;

	friend bool operator < ( const int2 &x, const int2 &y )
		{ return x.val < y.val; }
	friend bool operator == ( const int2 &x, const int2 &y )
		{ return x.val == y.val && x.id == y.id; }
	friend ostream & operator << ( ostream &stream, const int2 &x )
		{ return stream << x.val << "/" << x.id; }
};

template < typename T >
static vector< T > random_vector();

/*! @brief Generate a random vector< int >. */
template <> vector< int > random_vector< int >()
{
	vector< int > v( rnd() % 50 );
	int value = 0;

	for ( vector< int >::iterator i = v.begin(); i != v.end(); ++i ) {
		value += rnd() % 10;
		*i = value;
	}

	return v;
}

/*! @brief Generate a random vector< int2 >. */
template <> vector< int2 > random_vector< int2 >()
{
	vector< int2 > v( rnd() % 50 );
	int value = 0;
	static int id = 0;

	for ( vector< int2 >::iterator i = v.begin(); i != v.end(); ++i ) {
		value += rnd() % 10;
		i->val = value;
		i->id = id++;
	}

	return v;
}

/*! @brief Print a vector. */
template < typename T >
static ostream & operator << ( ostream &stream, const vector< T > &v )
{
	copy( v.begin(), v.end(),
		ostream_iterator< T >( stream, ", " ) );
	return stream;
}

/*! @brief Test NSetsMerge against std::inplace_merge. */
template < typename T >
static int test_merge() {
	NSetsMerge< typename vector< T >::const_iterator > un;
	vector< vector< T > > vs( rnd() % 50 );
	vector< T > std_un, our_un;

	for ( typename vector< vector< T > >::iterator i = vs.begin();
			i != vs.end(); ++i ) {
		*i = random_vector< T >();

		size_t mid = std_un.size();
		copy( i->begin(), i->end(), back_inserter( std_un ) );
		inplace_merge( std_un.begin(), std_un.begin() + mid, std_un.end() );

		un.add( i->begin(), i->end() );
	}

	/* our_un = merge all vs[i] */
	un.save( back_inserter( our_un ) );

	if ( std_un != our_un ) {
		cerr << "FAIL:" << endl;
		for ( typename vector< vector< T > >::iterator i = vs.begin();
				i != vs.end(); ++i )
			cerr << "\tvec: " << *i << endl;
		cerr << "\tstd_un: " << std_un << endl;
		cerr << "\tour_un: " << our_un << endl;
		return -1;
	}

	return 0;
}

static FunTest t1( test_merge< int >, "NSetsMerge", TEST_RUNS );
static FunTest t2( test_merge< int2 >, "NSetsMerge stability", TEST_RUNS );

int main()
{
	return TestRunner::instance().runAll( cout );
}
