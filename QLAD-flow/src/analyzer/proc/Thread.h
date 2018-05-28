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
#include <pthread.h>
#include <cerrno>
#include <csetjmp>
#include <unistd.h>
#include <cstdlib> // exit()
#include <iostream>

/*!
 * @class Thread Thread.h "proc/Thread.h"
 * @brief POSIX threads API wrapper class
 *
 * Provides C++ interface for POSIX threads.
 */
class Thread
{
public:
	/*!
	 * @brief Construct thread to run provided function.
	 * @tparam ARGT Argument type, function parameter is a pointer to this type.
	 * @param func Function to run in a separate thread.
	 * @param arg Argument to pass to the function
	 * @param autostart Start the thread immediately.
	 *
	 * ARGT template parameter is present purely for convenience, function
	 * is cast to void *(*)(void*) and parameter to void * during
	 * construction.
	 */
	template<typename ARGT>
	Thread( void *(*func)(ARGT*), ARGT *arg, bool autostart = false )
	: mFunction( reinterpret_cast<void *(*)(void*)>( func ) ),
	  mArgument( arg ), mResult( NULL ), mThread( 0 )
		{ if (autostart) { run(); } }

	/*! @brief Only for DEBUG use. */
	~Thread()
		{ assert( mThread == 0 ); }

	/*!
	 * @brief Create POSIX thread, if not already created.
	 *
	 * Sets built-in thread identifier.
	 */
	bool run()
	{
		if (mThread == 0) {
#define MAX_ATTEMPTS 2
#define SLEEP_SECS   1
			volatile int attempt = 0;
			sigjmp_buf env;
			sigsetjmp(env, 1);
			++attempt;
			int res = pthread_create( &mThread, NULL,
			                          mFunction, mArgument );
			assert( res == 0 );
			if ( (res == EAGAIN) && (attempt < MAX_ATTEMPTS) ) {
				sleep(SLEEP_SECS);
				siglongjmp(env, 1);
			} else if ( res != 0 ) {
				/* TODO - throw/log error? */
				std::cerr <<  "Cannot create thread\n";
				mThread = 0;
				exit(1);
			}
			return true;
		}
		return false;
#undef MAX_ATTEMPTS
#undef SLEEP_SECS
	}

	/*!
	 * @brief Get result as returned by pthread_join
	 * @return The result, NULL by default (if the thread has not been joined).
	 */
	void * result()
		{ return mResult; }

	/*!
	 * @brief Join the thread represented by the instance.
	 *
	 * Sets result. Frees built-in thread identifier.
	 */
	void join()
	{
		assert(mThread);
		if ( mThread ) {
			pthread_join( mThread, &mResult );
			mThread = 0;
		}
	}

	/*! @brief Yields the currently running thread. */
	static void yield()
		{ pthread_yield(); }

protected:
	void * (*mFunction)(void*);/*!< @brief Function to run in a separate thread.*/
	void *mArgument;           /*!< @brief Argument to pass to the #mFunction. */
	void *mResult;             /*!< @brief Result returned by the #mFunction. */
	pthread_t mThread;         /*!< @brief Internal pthread identifier. */
};
