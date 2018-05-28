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

#include <cassert>
#include <list>

#include <pcap.h>

#include "CaptureSession.h"
#include "Detector.h"
#include "policies/IPPolicy.h"
#include "policies/QueryNamePolicy.h"
#include "policies/QueryNamePolicy.h"
#include "proc/ThreadPool.h"
#include "Settings.h"
#include "Storage.h"
#include "log/Log.h"


#ifndef NDEBUG
//template class Detector<POLICY>;
//template class Storage<POLICY>;
#endif

/*!
 * @brief Analyses the data within the capture session using source IP policy.
 * @param opt Options
 */
void analyseWithSrcIPPolicy( const Settings &opt );

/*!
 * @brief Analyses the data within the capture session using
 *        destination IP policy.
 * @param opt Options
 */
void analyseWithDstIPPolicy( const Settings &opt );

/*!
 * @brief Analyses the data within the capture session using query name policy.
 * @param opt Options
 */
void analyseWithQueryNamePolicy( const Settings &opt );

/*!
 * @brief The main function for the analyser sub-project.
 * @param argc Argument count
 * @param argv Argument vector
 *
 * Expects file name as the second argument in the argument vector. Repeatedly
 * starts capture and analysis of data.
 */
int main( int argc, char *argv[] )
{

	const Settings opt( argc, argv );
	if ( !opt.isValid() ) {
		::std::cerr
		  << "Invalid parameter value specified, use -h for help.\n";
		return 1;
	}

	/* initialize logger */
	int fileid = GlobalLog.openFile("run.log", "w");
	/* runtime log file */
	GlobalLog.levelsSet( fileid, Log::LOGS_ANY, LOG_UPTO(LOG_DEBUG) );
	/* standard error output */
	GlobalLog.levelsSet( Log::LOGF_STDERR, Log::LOGS_ANALYZER,
	                     LOG_UPTO(LOG_WARNING) );

	if (!CaptureSession::instance().openOffline( opt.file, opt.filter ))
		{ return 1; }

	/* Create global therad pool containing opt.thread_count threads. */
	ThreadPool::globalInstance(opt.thread_count).run();

	switch ( opt.policy ) {
		case srcIP :
			analyseWithSrcIPPolicy( opt );
			break;
		case dstIP :
			analyseWithDstIPPolicy( opt );
			break;
		case queryName :
			analyseWithQueryNamePolicy( opt );
			break;
		default :
			break;
	}

	CaptureSession::instance().close();

	return 0;
}
/* ------------------------------------------------------------------------- */
void analyseWithSrcIPPolicy( const Settings &opt )
{

#define POLICY SrcIPPolicy
	typedef Storage<POLICY> TStorage;
	typedef Detector<POLICY> TDetector;
#undef POLICY

	::std::list<TDetector *> detectors;
	TStorage storage( opt.window_size );

	if ( CaptureSession::instance().canCapture() ) {
		/* Capture enough packets to fill the analysis window. */
		CaptureSession::instance().startCapture(
		  &storage, opt.window_size );

		/* Analyse stored data. - Creates and runs all the Engines. */
		TDetector *detector = new TDetector(
		  storage, opt.hash_count, opt.sketch_count,
		  opt.aggregation_count, opt.detection_threshold,
		  opt.aggregate, opt.analysed_parameter,
		  opt.gnuplot_anomalies_dir,
#ifdef GNUPLOT_INTERMED
		  opt.gnuplot_intermediate_dir
#else
		  NULL
#endif
		);

		/* Collects result from the Engines. */
		ThreadPool::globalInstance().addJob( detector );
		detectors.push_back( detector );
	}

	while ( CaptureSession::instance().canCapture() ) {
		/* Capture packets to next analyzing point */
		CaptureSession::instance().startCapture(
		  &storage, opt.detection_interval );
		/* Make sure there is only relevant data. */
		storage.sync();

		/* Analyse stored data. */
		TDetector *detector = new TDetector(
		  storage, opt.hash_count, opt.sketch_count,
		  opt.aggregation_count, opt.detection_threshold,
		  opt.aggregate, opt.analysed_parameter,
		  opt.gnuplot_anomalies_dir,
#ifdef GNUPLOT_INTERMED
		  opt.gnuplot_intermediate_dir
#else
		  NULL
#endif
		);

		ThreadPool::globalInstance().addJob( detector );
		detectors.push_back( detector );

		/* Remove finished detectors. */
		while (!detectors.empty() && detectors.front()->done()) {
			delete detectors.front();
			detectors.pop_front();
		}
	}

	/* Wait for ongoing analysis before exiting. */
	while ( !detectors.empty() ) {
		detectors.front()->waitForDone();
		delete detectors.front();
		detectors.pop_front();
	}

}
/* ------------------------------------------------------------------------- */
void analyseWithDstIPPolicy( const Settings &opt )
{

#define POLICY DstIPPolicy
	typedef Storage<POLICY> TStorage;
	typedef Detector<POLICY> TDetector;
#undef POLICY

	::std::list<TDetector *> detectors;
	TStorage storage( opt.window_size );

	if ( CaptureSession::instance().canCapture() ) {
		/* Capture enough packets to fill the analysis window. */
		CaptureSession::instance().startCapture(
		  &storage, opt.window_size );

		/* Analyse stored data. - Creates and runs all the Engines. */
		TDetector *detector = new TDetector(
		  storage, opt.hash_count, opt.sketch_count,
		  opt.aggregation_count, opt.detection_threshold,
		  opt.aggregate, opt.analysed_parameter,
		  opt.gnuplot_anomalies_dir,
#ifdef GNUPLOT_INTERMED
		  opt.gnuplot_intermediate_dir
#else
		  NULL
#endif
		);

		/* Collects result from the Engines. */
		ThreadPool::globalInstance().addJob( detector );
		detectors.push_back( detector );
	}

	while ( CaptureSession::instance().canCapture() ) {
		/* Capture packets to next analyzing point */
		CaptureSession::instance().startCapture(
		  &storage, opt.detection_interval );
		/* Make sure there is only relevant data. */
		storage.sync();

		/* Analyse stored data. */
		TDetector *detector = new TDetector(
		  storage, opt.hash_count, opt.sketch_count,
		  opt.aggregation_count, opt.detection_threshold,
		  opt.aggregate, opt.analysed_parameter,
		  opt.gnuplot_anomalies_dir,
#ifdef GNUPLOT_INTERMED
		  opt.gnuplot_intermediate_dir
#else
		  NULL
#endif
		);

		ThreadPool::globalInstance().addJob( detector );
		detectors.push_back( detector );

		/* Remove finished detectors. */
		while (!detectors.empty() && detectors.front()->done()) {
			delete detectors.front();
			detectors.pop_front();
		}
	}

	/* Wait for ongoing analysis before exiting. */
	while ( !detectors.empty() ) {
		detectors.front()->waitForDone();
		delete detectors.front();
		detectors.pop_front();
	}

}
/* ------------------------------------------------------------------------- */
void analyseWithQueryNamePolicy( const Settings &opt )
{

#define POLICY QueryNamePolicy
	typedef Storage<POLICY> TStorage;
	typedef Detector<POLICY> TDetector;
#undef POLICY

	::std::list<TDetector *> detectors;
	TStorage storage( opt.window_size );

	if ( CaptureSession::instance().canCapture() ) {
		/* Capture enough packets to fill the analysis window. */
		CaptureSession::instance().startCapture(
		  &storage, opt.window_size );

		/* Analyse stored data. - Creates and runs all the Engines. */
		TDetector *detector = new TDetector(
		  storage, opt.hash_count, opt.sketch_count,
		  opt.aggregation_count, opt.detection_threshold,
		  opt.aggregate, opt.analysed_parameter,
		  opt.gnuplot_anomalies_dir,
#ifdef GNUPLOT_INTERMED
		  opt.gnuplot_intermediate_dir
#else
		  NULL
#endif
		);

		/* Collects result from the Engines. */
		ThreadPool::globalInstance().addJob( detector );
		detectors.push_back( detector );
	}

	while ( CaptureSession::instance().canCapture() ) {
		/* Capture packets to next analyzing point */
		CaptureSession::instance().startCapture(
		  &storage, opt.detection_interval );
		/* Make sure there is only relevant data. */
		storage.sync();

		/* Analyse stored data. */
		TDetector *detector = new TDetector(
		  storage, opt.hash_count, opt.sketch_count,
		  opt.aggregation_count, opt.detection_threshold,
		  opt.aggregate, opt.analysed_parameter,
		  opt.gnuplot_anomalies_dir,
#ifdef GNUPLOT_INTERMED
		  opt.gnuplot_intermediate_dir
#else
		  NULL
#endif
		);

		ThreadPool::globalInstance().addJob( detector );
		detectors.push_back( detector );

		/* Remove finished detectors. */
		while (!detectors.empty() && detectors.front()->done()) {
			delete detectors.front();
			detectors.pop_front();
		}
	}

	/* Wait for ongoing analysis before exiting. */
	while ( !detectors.empty() ) {
		detectors.front()->waitForDone();
		delete detectors.front();
		detectors.pop_front();
	}

}
