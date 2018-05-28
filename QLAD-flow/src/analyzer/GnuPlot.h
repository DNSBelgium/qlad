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

#include <iostream>
#include <sstream>
#include <fstream>
#include "Engine.h"


#ifdef GNUPLOT_INTERMED
/*!
 * @class GnuPlot GnuPlot.h "GnuPlot.h"
 * @brief GnuPlot output module for debugging sketches and gamma parameters.
 */
class GnuPlot {
public:
	/*!
	 * @brief Initialize gnuplot output.
	 * @param seq The index of this input time fragment.
	 * @param dir The directory to place output files into.
	 * @param eng The engine to take policy name and aggregation count
	 *            from.
	 */
	template <typename POLICY>
	GnuPlot( unsigned seq, ::std::string dir, const Engine<POLICY> &eng );

	/*!
	 * @brief Write the resulting gnuplot file.
	 */
	~GnuPlot();

	/* Filename helpers. */
	::std::string fileIteration( unsigned index );
	::std::string fileSketches( unsigned index, unsigned aggregation );
	::std::string fileDistances( unsigned index );

	/*!
	 * @brief Plot single hash iteration.
	 * @param eng An engine with valid, processed data.
	 */
	template <typename POLICY>
	GnuPlot & operator << ( const Engine<POLICY> &eng );

private:
	unsigned mIterations;
	::std::string mInput;

	const unsigned mAggregationCount;
	const ::std::string mDir;
};
#endif

/*!
 * @class AnomalyPlotter GnuPlot.h "GnuPlot.h"
 * @brief Outputs plot of all traffic along with traffic of anomalies
 *        in gnuplot format.
 */
template <class Identifier>
class AnomalyPlotter
{
	typedef ::std::map<const Identifier*, const SparseFlow*> TFlowMap;
public:

	/*!
	 * @brief Constructs plotter instance for traffic flow.
	 * @param allTraffic flow containing all traffic
	 */
	AnomalyPlotter( const SparseFlow* allTraffic );

	/*!
	 * Add anomaly to be plotted on the graph.
	 * @param id identifier to be shown on the graph
	 * @param flow flow data of the anomaly
	 *
	 * This object does not take ownership of identifier or flow.
	 */
	void addAnomaly( const Identifier* id, const SparseFlow* flow );

	/*!
	 * Outputs gnuplot-format file into stream.
	 * @param out output stream where to write
	 * @param pngFilename png filename that will be created when plot is
	 *                    passed through gnuplot
	 * @param logscale whether the Y axis should be in logarithmic scale
	 */
	void plot( ::std::ostream& out, const ::std::string pngFilename,
	           bool logscale );

private:

	const SparseFlow* mAllTraffic;

	TFlowMap mAnomalies;
};


/* ------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* ------------------------------------------------------------------------- */
#ifdef GNUPLOT_INTERMED
template <typename POLICY>
GnuPlot::GnuPlot( unsigned seq, ::std::string dir, const Engine<POLICY> &eng )
	: mIterations( 0 ), mAggregationCount( eng.aggregationCount() ),
	  mDir( dir + "/" )
{
	::std::ostringstream itmp;
	itmp << seq << "_" << POLICY::NAME;
	mInput = itmp.str();
}
/* ------------------------------------------------------------------------- */
GnuPlot::~GnuPlot()
{
	::std::ofstream fGpi( ( mDir + mInput + ".gpi" ).c_str() );

	fGpi << "set terminal pngcairo linewidth 0.6 dashed size "
	     << 9 * (mAggregationCount + 1) << "in,"
	     << 6 * mIterations << "in\n"
	     << "input = \"" << mInput << "\"\n"
	     << "set output input.\".png\"\n"
	     << "set multiplot layout " << mIterations << ","
	     << mAggregationCount + 1 << "\n" << ::std::endl
	     << "_ln_dgamma(x, a, b) = a*log(b) - lgamma(a) + (a-1)*log(x) - "
	        "b*x\n"
	     << "dgamma(x, shape, rate) = \\\n"
	     << " (x<0)? 0 : \\\n"
	     << " (x==0)? ((shape<1)? 1/0 : (shape==1)? rate : 0) : \\\n"
	     << " (rate==0)? 0 : \\\n"
	     << " exp(_ln_dgamma(x, shape, rate))\n"
	     << "f(x, k, t) = dgamma(x, k, 1.0/t)\n"
	     << ::std::endl
	     << "set y2r[0:0]\n"
	     << "unset autoscale y2\n"
	     << "set autoscale y2max\n"
	     << "set ytics nomirror\n"
	     << ::std::endl;

	for ( unsigned i = 0; i < mIterations; ++i )
		{ fGpi << "load input.\".h" << i << ".gpi\"\n"; }

	fGpi << "\nunset multiplot" << ::std::endl;
}
/* ------------------------------------------------------------------------- */
::std::string GnuPlot::fileIteration( unsigned index )
{
	::std::ostringstream name;
	name << mDir << mInput << ".h" << index << ".gpi";
	return name.str();
}
/* ------------------------------------------------------------------------- */
::std::string GnuPlot::fileSketches( unsigned index, unsigned aggregation )
{
	::std::ostringstream name;
	name << mDir << mInput << ".h" << index << ".a" << aggregation <<
	  ".txt";
	return name.str();;
}
/* ------------------------------------------------------------------------- */
::std::string GnuPlot::fileDistances( unsigned index )
{
	::std::ostringstream name;
	name << mDir << mInput << ".h" << index << ".d.txt";
	return name.str();
}
/* ------------------------------------------------------------------------- */
template <typename POLICY>
GnuPlot & GnuPlot::operator << ( const Engine<POLICY> &eng )
{
	assert( eng.done() );
	assert( mAggregationCount == eng.aggregationCount() );

	typedef Engine<POLICY> TEngine;
	typedef ::std::vector<long double> DoubleVector;

	const unsigned iteration = mIterations++;
	::std::ofstream fItr( fileIteration( iteration ).c_str() );

	::std::vector<DoubleVector>
	  distances( mAggregationCount, DoubleVector( eng.sketchCount() ) );

	// one column for each iteration
	for (unsigned j = 0; j < mAggregationCount; ++j) {
		::std::ofstream
		  fSketches( fileSketches( iteration, j ).c_str() );

		double maxX = 0;
		double divider = 0;

		// prepare sketch data, compute axis dimensions and
		// parameter distances from mean
		for (unsigned i = 0; i < eng.sketchCount(); ++i) {
			const typename TEngine::TSketch::TTimeSeries sketch =
			  eng.mSketches[i].sketch.series().aggregate(
			    eng.mAggregationFunction( j ) );

			fSketches << "\n\n# Sketch: " << i << "\n";
			sketch.plot( fSketches );

			// Y coefficient
			divider += sketch.size();

			// X maximum
			if ( !sketch.empty() ) {
				maxX =
				  ::std::max<double>( maxX,
				    *::std::max_element(
				      sketch.begin(), sketch.end() ) );
			}

			if (eng.mAnalysedGammaParam ==
			    GammaParameters::gammaShape) {
				distances[j][i] =
				  (eng.mSketches[i].params[j] - eng.mMean[j])
				    .shape() / sqrt(eng.mVariance[j].shape());
			} else if (eng.mAnalysedGammaParam ==
			           GammaParameters::gammaScale) {
				distances[j][i] =
				  (eng.mSketches[i].params[j] - eng.mMean[j])
				    .scale() / sqrt(eng.mVariance[j].scale());
			} else /* both parameters analysed together */ {
				long double c00, c01, /* var(sh),     cov(sh, sc) */
				            c10, c11; /* cov(cs, sh), var(sc)     */
				c00 = eng.mVariance[j].shape();
				c01 = c10 = eng.mCovariance[j];
				c11 = eng.mVariance[j].scale();
				/* inverting the covariance matrix */
				long double det = c00*c11 + c01*c10,
				            aux = c00;
				/* non-zero determinant == has an inverse */
				assert( det != 0.0 );
				c00 =   c11 / det; c01 = - c01 / det;
				c10 = - c10 / det; c11 =   aux / det;
				/* computing Mahalanobis distance */
				GammaParameters dist_tmp =
				  eng.mSketches[i].params[j] - eng.mMean[j];
				/*
				 * |c00 c01| == |  var(sh)   cov(sh, sc)| ** -1
				 * |c10 c11|    |cov(cs, sh)   var(sc)  |
				 *
				 * |dif(sh) dif(sc)| * |c00 c01| * |dif(sh)|
				 *                     |c10 c11|   |dif(sc)|
				 */
				distances[j][i] = sqrt(
				  (dist_tmp.shape()*c00 + dist_tmp.scale()*c10) *
				   dist_tmp.shape() +
				  (dist_tmp.shape()*c01 + dist_tmp.scale()*c11) *
				   dist_tmp.scale());
				/* TODO - the sqtr() looses direction */
			}
		}

		divider /= eng.sketchCount();

		fItr << "set xr[0:" << maxX * 1.1 << "]\n"
		     << "set y2tics\n";

		// probability distribution functions of the sketches
		fItr << "plot for [i=0:" << eng.sketchCount() - 1 << "] "
		     << "input.\".h" << iteration << ".a" << j << ".txt\" "
		     << "index i using 2:(1.0 / " << divider
		     << ") smooth frequency linecolor i with points notitle "
		     << "axes x1y2, \\\n";

		// PDFs of the estimated Gamma distributions
		for (unsigned i = 0; i < eng.sketchCount(); ++i) {
			if (i != 0)
				{ fItr << ", \\\n"; }
			fItr << " f(x, " << eng.mSketches[i].params[j].shape()
			     << ", "
			     << eng.mSketches[i].params[j].scale() << ") "
			     << "linecolor " << i << " linetype "
			     << ( eng.isAnomalous( eng.mSketches[i] ) ?
			          "2" : "1" )
			     << " with lines notitle";
		}
		fItr << "\n" << ::std::endl;
	}

	// visualize the distance from mean
	::std::ofstream fDist( fileDistances( iteration ).c_str() );
	for (unsigned i = 0; i < eng.sketchCount(); ++i) {
		fDist << "\n\n# Sketch: " << i << "\n";
		for (unsigned j = 0; j < mAggregationCount; ++j) {
			fDist << j << " " << distances[j][i] << "\n";
		}
		fDist << ::std::endl;
	}

	fItr << "set autoscale x\n"
	     << "unset y2tics\n"
	     << "plot \\\n"
	     << " " << eng.mThreshold
	     << " linecolor 0 linetype 3 with lines notitle, \\\n"
	     << " " << -eng.mThreshold
	     << " linecolor 0 linetype 3 with lines notitle, \\\n";

	for (unsigned i = 0; i < eng.sketchCount(); ++i) {
		if (i != 0)
			{ fItr << ", \\\n"; }
		fItr << " input.\".h" << iteration << ".d.txt\" "
		     << "index " << i << " linecolor " << i << " linetype "
		     << ( eng.isAnomalous( eng.mSketches[i] ) ? "2" : "1" )
		     << " with lines notitle";
	}
	fItr << "\n" << ::std::endl;

	return *this;
}
#endif
/* ------------------------------------------------------------------------- */
template <class Identifier>
AnomalyPlotter<Identifier>::AnomalyPlotter(const SparseFlow *allTraffic)
	: mAllTraffic( allTraffic )
{
}
/* ------------------------------------------------------------------------- */
template <class Identifier>
void AnomalyPlotter<Identifier>::plot( ::std::ostream &out,
                                       const::std::string pngFilename,
                                       bool logscale )
{
	out << "set terminal pngcairo size 1024,768\n"
	    << "set output '" << pngFilename << "'\n"
	        << "set ylabel 'Queries per second'\n"
	        << "set xlabel 'Time'\n"
	        << "set xdata time\nset timefmt \"%s\"\n";
	if ( logscale ) {
		out << "set log y\n";
	}

	out << "plot \\\n"
	    << "'-' using 1:2 linecolor 0 linetype 2 with lines title 'All'";

	typename TFlowMap::const_iterator it = mAnomalies.begin();
	for (int i=1; it != mAnomalies.end(); ++it, ++i) {
		out << ", \\\n'-' using 1:2 linecolor " << i
		    << " linetype 3 with impulses title \""
		    << *(it->first) << "\"";
	}

	out << ::std::endl;

	mAllTraffic->plot( out );
	out << "e\n";

	for (it = mAnomalies.begin(); it != mAnomalies.end(); ++it) {
		        it->second->plot( out );
		        out << "e\n";
	}
}
/* ------------------------------------------------------------------------- */
template <class Identifier>
void AnomalyPlotter<Identifier>::addAnomaly( const Identifier *id,
                                             const SparseFlow *flow )
{
	mAnomalies.insert(::std::make_pair(id, flow));
}
