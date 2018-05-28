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

#include <ostream>
#include <cassert>

#include "proc/Runnable.h"
#include "statistics/statistics.h"
#include "sync/Signaler.h"
#include "util/NSetsMerge.h"
#include "Sketch.h"
#include "Storage.h"
#include "log/Log.h"
#include "statistics/GammaParameters.h"

template<typename POLICY>
class Engine;

template<typename POLICY>
::std::ostream & operator << (
  ::std::ostream &stream, const Engine<POLICY> &engine );

/*!
 * @class Engine Engine.h "Engine.h"
 * @brief Main analysing class.
 * @tparam POLICY Identifiers used to identify flows and hash function.
 *
 * Analyses data provided by the Storage class, requires read-only access.
 */
template<typename POLICY>
class Engine: public Runnable
{
public:
	/*! @brief Convenience typedef, exports used Storage class. */
	typedef Storage<POLICY> Source;
	/*! @brief Convenience typedef, exports used Sketch class. */
	typedef Sketch<typename POLICY::id_t> TSketch;
	/*! @brief Convenience typedef, exports used Id set class. */
	typedef typename TSketch::IdSet IdSet;
	/*! @brief Convenience typedef, multiple GammaDistribution::Params */
	typedef ::std::vector< ::Statistics::GammaDistribution::Params >
	  ParameterVector;
	/*! @brief Conevenience typedef, multiple covariance values */
	typedef ::std::vector< long double > CovarianceVector;

	/*!
	 * @struct SketchParams Engine.h "Engine.h"
	 * @brief Struct for holding Sketch relevant information.
	 */
	struct SketchParams {
		TSketch sketch;         /*!< @brief Sketch to Store data. */
		long double distance;   /*!< @brief Distance from the mean. */
		/*! @brief GammaParams for every time aggregation. */
		ParameterVector params;

		/*! @brief Forwards parameters to member construction. */
		SketchParams( time_t time, size_t size, unsigned agg_count )
		: sketch( time, size ), distance( 0 ),
		  params( agg_count,
		    ::Statistics::GammaDistribution::Params::Invalid ) {}
	};

	/*!
	 * @brief Constructs initialized engine.
	 *
	 * @param hash_index Index of the function to use.
	 * @param source Storage to use.
	 * @param sketch_count Number of Sketches to use during analysis.
	 * @param aggreg_count Number of Time aggregations to use.
	 * @param detection_threshold Minimum distance for sketches to be
	 *                            considered anomalous.
	 * @param aggregation_fnc Function providing time aggregation values.
	 * @param analysed_parameter Analysed Gamma distribution parameter
	 */
	Engine(
	  unsigned hash_index,
	  const Source &source,
	  unsigned sketch_count,
	  unsigned aggreg_count,
	  long double detection_threshold,
	  unsigned (*aggregation_fnc)( unsigned ),
	  GammaParameters::type analysed_parameter
	)
	: mAggregationFunction( aggregation_fnc ),
	  mHashIndex( hash_index ),
	  mThreshold( detection_threshold ),
	  mSource( source ),
	  mDone( false ),
	  mSketches( sketch_count,
	    SketchParams( source.startTime(), source.windowSize(),
	      aggreg_count ) ),
	  mMean( aggreg_count,
	    ::Statistics::GammaDistribution::Params::Invalid ),
	  mVariance( aggreg_count,
	    ::Statistics::GammaDistribution::Params::Invalid ),
	  mCovariance( aggreg_count, 0.0 ),
	  mAnalysedGammaParam ( analysed_parameter )
	{}

	/*!
	 * @brief Constructs Engine using parameters from another instance
	 * @param other Instance to provide parameters.
	 */
	Engine( const Engine &other )
	: mAggregationFunction( other.mAggregationFunction ),
	  mHashIndex( other.mHashIndex ),
	  mThreshold( other.mThreshold ),
	  mSource( other.mSource ),
	  mDone( false ),
	  mSketches( other.mSketches.size(),
	    SketchParams( other.mSource.startTime(),
	      other.mSource.windowSize(),
	      other.aggregationCount() ) ),
	  mMean( other.aggregationCount(),
	    ::Statistics::GammaDistribution::Params::Invalid ),
	  mVariance( other.aggregationCount(),
	    ::Statistics::GammaDistribution::Params::Invalid ),
	  mCovariance( other.aggregationCount(), 0.0 ),
	  mAnalysedGammaParam( other.mAnalysedGammaParam )
	{}

	/*!
	 * @brief Gets Ids from sketches declared anomalous.
	 * @return Ids from one or more anomalous sketches.
	 */
	const IdSet & getAnomalousIDs() const
		{ assert(mDone); return mAnomalousIds; }

	/*!
	 * @brief Gets number of sketches used by the Engine.
	 * @return Number of Sketches.
	 */
	unsigned sketchCount() const
		{ return mSketches.size(); }

	/*!
	 * @brief Gets number of time aggregations used during analysis
	 * @return Number of aggregations
	 */
	unsigned aggregationCount() const
	{
		assert(mMean.size() == mVariance.size());
		return mMean.size();
	}

	/*!
	 * @brief Call processing functions and mark processing as done.
	 *
	 * First random projection, then statistical approximation and
	 * identifier extraction. Mark as done to wake waiting threads.
	 */
	void process();

	/*! @brief Runnable class implementation. */
	void run()
		{ process(); }

	/*! @brief Get current processing status. */
	bool done() const
		{ return mDone; }

	/*! @brief Block until the data processing is done. */
	void waitDone() const
		{ mDone.waitSignal(); }

	/*!
	 * @brief Output data from sketches, in a plot-friendly format.
	 * @param stream Use as output.
	 */
	void plot( ::std::ostream &stream ) const;

protected:
	/*! @brief Converts aggregation index to seconds. */
	unsigned (* const mAggregationFunction)( unsigned );
	/*! @brief Index of the hash function to use. */
	const unsigned mHashIndex;
	/*! @brief Minimal distance to consider sketch anomalous. */
	const long double mThreshold;

	/*! @brief Data provider. */
	const Source &mSource;
	/*! @brief Progress indicator. */
	Signaler mDone;
	/*! @brief Identifier from all anomalous sketches. */
	IdSet mAnomalousIds;

	/*! @brief Convenience typedef. */
	typedef ::std::vector<SketchParams> SketchList;
	/*! @brief A place to store the Sketches. */
	SketchList mSketches;

	/*! @brief Mean vector for approximate parameters */
	ParameterVector mMean;
	/*! @brief Variance vector for approximate parameters */
	ParameterVector mVariance;
	/*! @brief Covariance vector for approximate paramaters */
	CovarianceVector mCovariance;

	/*! @brief Analysed Gamma distribution parameter */
	GammaParameters::type mAnalysedGammaParam;

	/*!
	 * @brief Use random projection on data from #mSource.
	 *
	 * Read all Flows from #mSource and hash them into #mSketches,
	 * using function indexed by #mHashIndex.
	 * Uses POLICY::hash()
	 */
	void hash();

	/*!
	 * @brief Statistically approximate Sketch Flow data.
	 *
	 * Approximate Gamma distribution parameters for various time
	 * aggregations and store them in #mSketches.
	 * Compute mean and variance ( #mMean, #mVariance ).
	 */
	void approximateParams();

	/*! @brief Merge IDs from anomalous Sketches into #mAnomalousIds. */
	void findAnomalousIDs();

	bool isAnomalous( const SketchParams &sketch ) const;

private:
	/*! @brief FORBIDDEN operator. */
	Engine & operator = ( const Engine & );

	/*!
	 * @brief ::std::ostream operator for formatted output.
	 * @param stream Output stream
	 * @param engine Engine instance to print
	 * @return ::std::ostream used
	 *
	 * Outputs string: "Engine with id policy: %policy, Sketches: %count,
	 * where %policy is the name specified by POLICY::NAME and %count is
	 * the number of @link Sketch Sketches @endlink used by the Engine.
	 * This string is followed by reference mean and reference variance
	 * vectors.
	 * Then outputs every sketch used by the engine, its gamma parameters
	 * and distance from the reference.
	 */
	friend ::std::ostream & operator << <POLICY>
		( ::std::ostream &stream, const Engine<POLICY> &engine );

	friend class GnuPlot;
};
/* ------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Engine<POLICY>::process()
{
	if (!mDone) {
		hash();
		approximateParams();
		findAnomalousIDs();
		mDone = true;
	}
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Engine<POLICY>::hash()
{
	typename Source::const_iterator it = mSource.begin();
	for (; it != mSource.end(); ++it) {
		const unsigned index =
		  POLICY::hash( mHashIndex, it->first ) % mSketches.size();
		mSketches[index].sketch.addFlow( it->first, it->second );
	}

	for (typename SketchList::const_iterator it = mSketches.begin();
	  it != mSketches.end(); ++it) {

		/*
		 * The following !.empty() assert will fail:
		 *   1) if not enough packets captured
		 *   2) if analysing unordered sequence 
		 *        (which falls back to point 1 - because of generating
		 *         empty time-windows)
		 */
		//assert( !it->sketch.identifiers().empty() );
		if ( it->sketch.identifiers().empty() ) {
			::std::cerr << "failed to fill all sketches, "
			  "aborting\n";
			exit(1);
#ifdef DEBUG
			GlobalLog.logAnalyzerDebug(
			  "generated empty sketch while hashing\n");
#endif
		}
		assert( it->sketch.series().size() == mSource.windowSize() );
	}
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Engine<POLICY>::approximateParams()
{
	for (unsigned j = 0; j < aggregationCount(); ++j) {

		for (typename SketchList::iterator it = mSketches.begin();
		  it != mSketches.end(); ++it) {
			using namespace ::Statistics::GammaDistribution;
			const Params tmp =
			  estimate( it->sketch.series().aggregate(
			    mAggregationFunction( j ) ) );

			/*
			 * The isValid() assert fails when:
			 *   analysed sketch has only one sample
			 *     (variance is zero - invalid value)
			 *       possibly caused by too high aggregation level
			 */
			//assert( tmp.isValid() );

			if ( tmp.isValid() ) {
				it->params[j] = tmp;
				mMean[j] += tmp;
				mVariance[j] += tmp ^ 2;
				mCovariance[j] += tmp.scale() * tmp.shape();
			}
#ifdef DEBUG
			else {
				GlobalLog.logAnalyzerDebug(
				  "invalid distribution, "
				  "maybe aggregation level %u too high\n",
				   j + 1); /* adding 1 for convenience */
			}
#endif

		}

		mMean[j] /= mSketches.size();
		mVariance[j] /= mSketches.size();
		mVariance[j] -= (mMean[j] ^ 2);
		mCovariance[j] /= mSketches.size();
		mCovariance[j] -= mMean[j].scale() * mMean[j].shape();
	}
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Engine<POLICY>::findAnomalousIDs()
{
	NSetsMerge< typename IdSet::const_iterator > un;

	for (typename SketchList::iterator it = mSketches.begin();
	  it != mSketches.end(); ++it) {
		if ( !it->sketch.identifiers().empty() ) {
			it->distance = ::Statistics::getMahalanobisDistance(
			  mMean, mVariance, mCovariance, it->params,
			  mAnalysedGammaParam );

			if (isAnomalous(*it)) {
				const IdSet &culprit =
				  it->sketch.identifiers();
				un.add( culprit.begin(), culprit.end() );
			}
		}
#ifdef DEBUG
		else {
			GlobalLog.logAnalyzerDebug(
			  "dropping empty sketch while finding anomalies\n");
		}
#endif
	}

	un.save( ::std::back_inserter( mAnomalousIds ) );
	/* mAnomalousIds is a set because the input sequences were disjunct. */
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
bool Engine<POLICY>::isAnomalous( const SketchParams &sketch ) const
{
	return sketch.distance > mThreshold;
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
void Engine<POLICY>::plot( ::std::ostream &stream ) const
{
	assert( mDone );
	unsigned count = 0;
	for (typename SketchList::const_iterator it = mSketches.begin();
	  it != mSketches.end(); ++it) {
		stream << "\n\n# Sketch: " << count++ << "\n";
		it->sketch.plot( stream );
	}
}
/* ------------------------------------------------------------------------- */
template<typename POLICY>
::std::ostream & operator << (
  ::std::ostream &stream, const Engine<POLICY> &engine
)
{
	stream << "Engine with id policy: " << POLICY::NAME
	  << ", Sketches = " << engine.mSketches.size() << "\n";

	stream << "Reference: mean {";
	for (unsigned j = 0; j < engine.aggregationCount(); ++j) {
		if ( j > 0 ) { stream << ", "; }
		stream << engine.mMean[j];
	}
	stream << "}\n";

	stream << "Reference: variance {";
	for (unsigned j = 0; j < engine.aggregationCount(); ++j) {
		if (j > 0) { stream << ", "; }
		stream << engine.mVariance[j];
	}
	stream << "}\n";

	stream << "Reference: covariance {";
	for (unsigned j = 0; j < engine.aggregationCount(); ++j) {
		if (j > 0) { stream << ", "; }
		stream << engine.mCovariance[j];
	}
	stream << "}\n";

	unsigned count = 0;
	for ( typename Engine<POLICY>::SketchList::const_iterator it =
	  engine.mSketches.begin(); it != engine.mSketches.end(); ++it) {
		stream << "\tSketch" << count++ << ": " << it->sketch << "\n";
		stream << "\t\tParameter vector : {";
		for (unsigned j = 0; j < engine.aggregationCount(); ++j) {
			if ( j > 0 )
				{ stream << ", " ; }
			stream << it->params[j];
		}
		stream << "}, "
		  << GammaParameters::typeNames[engine.mAnalysedGammaParam]
		  << " distance: " << it->distance << ::std::endl;
	}
	return stream;
}
