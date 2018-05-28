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

#include "ThreadPool.h"


void ThreadPool::run()
{
	mRun = true;
	ThreadList::iterator it;
	for (it = mThreads.begin(); it != mThreads.end(); ++it)
		{ it->run(); }
}
/* -------------------------------------------------------------------------- */
void ThreadPool::stop()
{
	mRun = false;
	for (unsigned i = 0; i < mThreads.size(); ++i)
		{ addJob( NULL ); }
	ThreadList::iterator it;
	for (it = mThreads.begin(); it != mThreads.end(); ++it)
		{ it->join(); }
}
/* -------------------------------------------------------------------------- */
void * ThreadPool::runJobs( ThreadPool *pool )
{
	assert( pool );
	while (pool->mRun) {
		pool->mJobCount.down();
		Runnable *job = pool->mJobs.pop( NULL ).second;
		if (job)
			{ job->run(); }
	}

	return NULL;
}
