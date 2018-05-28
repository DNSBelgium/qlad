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

# pragma once

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <list>
#include <unistd.h>

#include "Runnable.h"
#include "Thread.h"
#include "struct/SafeQueue.h"
#include "sync/Semaphore.h"

/*!
 * @class ThreadPool "ThreadPool.h"
 * @brief Execute jobs, using multiple threads.
 *
 * Thread count equals number of online CPUs by default.
 */
class ThreadPool
{
public:
	/*!
	 * @brief Construct a ThreadPool
	 * @param thread_count Number of threads to prepare.
	 */
	ThreadPool( unsigned thread_count = sysconf(_SC_NPROCESSORS_ONLN) )
	: mThreads( thread_count, Thread( runJobs, this ) ) {}

	/*!
	 * @brief Safe destruction of the pool.
	 *
	 * Makes sure no threads are running, before destroying the queue.
	 */
	~ThreadPool()
		{ stop(); }

	/*!
	 * @brief Number of threads used by the ThreadPool.
	 * @return Number of threads.
	 */
	unsigned threadCount()
		{ return mThreads.size(); };

	/*!
	 * @brief Start the prepared threads.
	 *
	 * Threads will start takingand executing jobs from the queue.
	 */
	void run();

	/*!
	 * @brief Stop all the threads, prevent them from taking another job.
	 *
	 * Will block until all the threads have finished their jobs.
	 */
	void stop();

	/*!
	 * @brief Adds a job to be processed.
	 *
	 * Do not destroy( or touch) the job while it is in the queue.
	 */
	void addJob( Runnable *job )
		{ mJobs.push( job ); mJobCount.up(); }

	/*! @brief Access to the global ThreadPool.
	 *  @param thread_count Number of threads to be created.
	 */
	static ThreadPool & globalInstance(
	  unsigned thread_count = sysconf(_SC_NPROCESSORS_ONLN) ) {
		static ThreadPool instance( thread_count );
		return instance;
	}

protected:
	/*!
	 * @brief Function to be run by the threads.
	 * @param pool Pointer to the source of jobs to execute.
	 * @return NOT USED
	 *
	 * Take job, execute, repeat.
	 */
	static void * runJobs( ThreadPool *pool );

	/*! @brief Convenience typedef. */
	typedef ::std::list<Thread> ThreadList;
	ThreadList mThreads;          /*!< @brief Threads in this ThreadPool */
	SafeQueue<Runnable *> mJobs;  /*!< @brief List of available jobs     */
	volatile bool mRun;           /*!< @brief Status indicator           */

	/*! @brief Counter of available jobs, blocks on zero */
	Semaphore mJobCount;
};
