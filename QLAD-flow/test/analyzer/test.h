#pragma once

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <iostream>
#include <vector>
#include <string>
#include <cassert>

/*! @brief A container for tests. */
class TestRunner {
public:
	/*! @brief A pure base class for individual tests. */
	class Test {
	public:
		/*!
		 * @brief Run the test.
		 * @return Zero for success, nonzero for failure.
		 */
		virtual int run() = 0;

		/*!
		 * @brief Constructor -- sets the private members and adds the
		 * test to the global TestRunner instance.
		 */
		Test( ::std::string name, unsigned runs = 1 )
		: mName( name ), mRuns( runs )
			{ TestRunner::instance().mTests.push_back( this ); }

		/*!
		 * Asserts that the global TestRunner collection is empty to
		 * catch errors caused by using Test non-statically.
		 */
		virtual ~Test()
			{ assert( TestRunner::instance().mTests.empty() ); }

	private:
		const ::std::string mName; //!< @brief The test name.
		const unsigned mRuns;      //!< @brief Number of test runs.

		friend class TestRunner;

		Test(); // disabled
		Test( const Test & ); // disabled
	};

	typedef ::std::vector< Test * > Tests;

	/*! @brief The global TestRunner instance. */
	static TestRunner & instance()
		{ static TestRunner r; return r; }

	/*!
	 * @brief Run all tests in the collection.
	 * @param out Stream to print results to.
	 */
	int runAll( ::std::ostream &out ) {
		int ret = 0;

		for ( Tests::iterator t = mTests.begin(); t != mTests.end(); ++t ) {
			unsigned fail = 0;

			for ( unsigned i = 0; i < (*t)->mRuns; ++i ) {
				// TODO: exceptions
				if ( (*t)->run() )
					++fail;
			}

			out << (*t)->mName << ": ";
			if ( fail == 0 )
				out << "PASSED " << (*t)->mRuns << " runs";
			else
				out << "FAILED " << fail << " out of "
				    << (*t)->mRuns << " runs";
			out << ::std::endl;

			ret |= ( fail != 0 );
		}

		/* Clear the collection for the assert in ~Test no to fire. */
		mTests.clear();

		return ret;
	}

private:
	/*! @brief The collection of tests. */
	Tests mTests;

	TestRunner() {}
	TestRunner & operator = ( const TestRunner & ); // disabled
	TestRunner( const TestRunner & ); // disabled
};

/*!
 * @brief A helper class to save some typing when the test is just a function.
 */
class FunTest : TestRunner::Test {
public:
	FunTest( int (*func) (), ::std::string name, unsigned runs = 1 )
	: Test( name, runs ), mFunc( func ) {}

private:
	int (* const mFunc)();

	int run()
		{ return mFunc(); }
};
