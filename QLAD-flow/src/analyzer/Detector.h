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

#include <algorithm>
#include <iostream>
#include <fstream>

#include "Engine.h"
#include "proc/ThreadPool.h"
#include "sync/Signaler.h"
#include "Storage.h"
#include "statistics/GammaParameters.h"
#include "GnuPlot.h"

/*!
 * @class Detector Detector.h "Detector.h"
 * @brief Engine creation and final detection class.
 * @tparam POLICY Specifies Storage and Engine classes.
 */
template<typename POLICY>
class Detector: public Runnable
{
public:
	typedef Storage<POLICY> TStorage;

	/*!
	 * @brief Constructs Detector on the data provided by the storage.
	 * @param storage Data to analyze.
	 * @param hash_iterations Number of hash functions to use in random
	 * projections.
	 * @param sketch_count Number of Sketches to divide the traffic into
	 * (Engine parameter).
	 * @param aggregation_count Number of time aggregations to perform
	 * (Engine parameter).
	 * @param detection_threshold Minimal distance to consider the sketch
	 * anomalous (Engine parameter).
	 * @param aggregate Function to convert aggregation index to seconds
	 * (Engine parameter).
	 * @param analysed_parameter Analysed Gamma distribution parameter
	 * @param gnuplot_anomalies_dir not NULL iff the detector should create
	 * gnuplot files that graph the anomalies
	 * @param gnuplot_intermediate_dir not NULL iff the detector should
	 * create gnuplot files containing intermediate data plots
	 *
	 * Creates Engines that will use the storage data, and adds them to the
	 * global ThreadPool.
	 */
	Detector(
	  const TStorage &storage,
	  unsigned hash_iterations,
	  unsigned sketch_count,
	  unsigned aggregation_count,
	  long double detection_threshold,
	  unsigned (*aggregate)(unsigned),
	  GammaParameters::type analysed_parameter,
	  const char * gnuplot_anomalies_dir,
	  const char * gnuplot_intermediate_dir
	);

	/*!
	 * @brief Uses results of engines' analysis to detect anomalies.
	 *
	 * Waits for engines to finish analysis. Sets done indicator when
	 * finished.
	 */
	void run();

	/*! @brief Gets value indicating detection progress. */
	bool done()
		{ return mDone; }

	/*! @brief Blocks until the detection is complete. */
	void waitForDone()
		{ mDone.waitSignal(); }

protected:
	typedef Engine<POLICY> TEngine;
	Signaler mDone;             /*!< @brief Progress indicator. */
	const TStorage mStorage;    /*!< @brief Place to store the data. */

	/*! @brief Engines to analyze the data. */
	typedef ::std::list<TEngine> EngineList;
	EngineList mEngines;

	/*! @brief Whether to create gnuplot files with plotted anomalies. */
	const char * mGnuplotAnomaliesDir;

	/*! @brief Whether to create gnuplot files visualizing intermediate
	 *  data. */
	const char * mGnuplotIntermediateDir;

private:
	/*! @brief DO NOT COPY! */
	Detector( const Detector & );

	/*! @brief DO NOT COPY! */
	Detector & operator = ( const Detector & );
};
/* ------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* ------------------------------------------------------------------------- */
template<typename POLICY>
Detector<POLICY>::Detector(
  const TStorage &storage,
  unsigned hash_iterations,
  unsigned sketch_count,
  unsigned aggregation_count,
  long double detection_threshold,
  unsigned (*aggregate)( unsigned ),
  GammaParameters::type analysed_parameter,
  const char * gnuplot_anomalies_dir,
  const char * gnuplot_intermediate_dir
)
: mDone( false ), mStorage( storage ),
  mGnuplotAnomaliesDir( gnuplot_anomalies_dir ),
  mGnuplotIntermediateDir (gnuplot_intermediate_dir )
{
	for (unsigned i = 0; i < hash_iterations; ++i) {
		TEngine engine( i, mStorage, sketch_count,
		  aggregation_count, detection_threshold, aggregate,
		  analysed_parameter);
		mEngines.push_back( engine );
		ThreadPool::globalInstance().addJob( &(mEngines.back()) );
	}
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Detector<POLICY>::run()
{
	typedef typename TEngine::IdSet AnomalySet;

	typename EngineList::const_iterator it = mEngines.begin();
	it->waitDone();
#ifdef GNUPLOT_INTERMED
	static unsigned seq = 0;
	GnuPlot gnuplot( ++seq,
	                 (mGnuplotIntermediateDir != NULL) ?
	                   mGnuplotIntermediateDir : "dummy",
	                 *it );
	if ( mGnuplotIntermediateDir != NULL ) {
		gnuplot << *it;
	}
#endif
	/* set is initialized by anomalies from the first engine */
	AnomalySet anomalies( it->getAnomalousIDs() );
	++it;

	for (; it != mEngines.end(); ++it) {
		it->waitDone();
#ifdef GNUPLOT_INTERMED
		if ( mGnuplotIntermediateDir != NULL )
			{ gnuplot << *it; }
#endif
		/* anomalies from the current engine */
		const AnomalySet & current_anomalies( it->getAnomalousIDs() );
		AnomalySet tmp;

		/* intersect anomalies from previous and current engines */
		::std::set_intersection( anomalies.begin(), anomalies.end(),
		  current_anomalies.begin(), current_anomalies.end(),
		  ::std::back_inserter( tmp ) );
		anomalies.swap( tmp );
	}

	/* output anomalies */
	if (anomalies.size() > 0) {
		const time_t start_time = mStorage.startTime();
		const time_t end_time = mStorage.endTime();

		/* man page says that 26B is enough */
		char time_string_start[26];
		char time_string_stop[26];
		ctime_r( &start_time, time_string_start );
		ctime_r( &end_time, time_string_stop );
		time_string_start[24] = '\0';
		time_string_stop[24] = '\0';

		::std::cout
		  << "From: " << time_string_start
		  << "\nTo: " << time_string_stop
		  << "\n\tfound anomalies (" << anomalies.size() << " / "
		  << mStorage.size() << ") : ";
		typename AnomalySet::const_iterator it;

		AnomalyPlotter<typename POLICY::id_t>
		  plotter(&mStorage.allTraffic());

		for (it = anomalies.begin(); it != anomalies.end(); ++it) {
			if (it != anomalies.begin())
				{ ::std::cout << ", "; }
			::std::cout << *it;
			plotter.addAnomaly(&(*it), &mStorage.at(*it));
		}

		::std::cout << ::std::endl;

		if ( mGnuplotAnomaliesDir != NULL )
		{
			::std::ostringstream name;
			name << mGnuplotAnomaliesDir << "/"
			  << time_string_start << ".gp";
			::std::ofstream file(name.str().c_str());
			plotter.plot(file,
			  ::std::string(time_string_start) + ".png", true);
		}
	}
	mDone = true;
}
