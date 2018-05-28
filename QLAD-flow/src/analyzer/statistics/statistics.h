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
#include <utility>
#include <vector>

#include <stdint.h>

#include "GammaParameters.h"

/*!
 * @brief Statistics functions namespace
 */
namespace Statistics
{
	/*!
	 * @brief Functions and classes around Gamma distribution.
	 */
	namespace GammaDistribution
	{
		/*! @brief Makes parameter class accessible within
		 * this namespace. */
		typedef GammaParameters Params;

		/*!
		 * @brief Calculates parameters using sample mean and variance.
		 * @param series Timeseries to estimate.
		 * @return Calculated Gamma distribution parameters.
		 */
		template <typename T>
		Params estimate( const T &series );
	}

	/*!
	 * @brief Calculates sample arithmetic mean and variance.
	 * @param series Timeseries to use.
	 * @return ::std::pair of calculated sample arithmetic mean
	 *                     and variance.
	 */
	template <typename T>
	::std::pair<long double, long double>
	  sampleMeanVariance( const T &series );

	/*!
	 * @brief Calculates distance of the parameter vector from provided
	 * reference.
	 * @tparam SIZE length of the vectors used.
	 * @param referenceMean Vector of GammaParameters to be used as mean.
	 * @param referenceVariance Vector of GammaParameters to be used
	 *                          as variance.
	 * @param referenceCovariance Vector of computed covariance values
	 *                            between GammaParameters.
	 * @param parameters Compute its distance from the reference.
	 * @param analysed_parameters Selects shape or scale to be used for
	 *                            distance computation.
	 * @return Calculated Mahalanobis distance.
	 *
	 * @note Distance of shape parameters is calculated.
	 */
	long double getMahalanobisDistance(
	  const ::std::vector<GammaDistribution::Params> &referenceMean,
	  const ::std::vector<GammaDistribution::Params> &referenceVariance,
	  const ::std::vector<long double> &referenceCovariance,
	  const ::std::vector<GammaDistribution::Params> &parameters,
	  const GammaParameters::type analysed_parameter
	);
}
/* ------------------------------------------------------------------------- */
/* IMPLEMENTATION */
/* ------------------------------------------------------------------------- */
template <typename T>
::Statistics::GammaDistribution::Params
  Statistics::GammaDistribution::estimate( const T &series )
{
	const ::std::pair<long double, long double>
	  mean_variance = sampleMeanVariance( series );

	const long double mean = mean_variance.first;
	const long double variance = mean_variance.second;

	if (variance == 0 || mean == 0)
		{ return Params::Invalid; }
	return Params( (mean * mean) / variance, variance / mean );
}
/* ------------------------------------------------------------------------- */
template <typename T>
::std::pair<long double, long double>
  Statistics::sampleMeanVariance( const T &series )
{
	long double square_sum = 0;
	long double sum = 0;
	unsigned count = 0;

	typedef typename T::const_iterator iterator;
	for (iterator it = series.begin(); it != series.end(); ++it) {
		const long double value = *it;
		square_sum += (value * value);
		sum += value;
		++count;
	}

	if (count == 0)
		{ return ::std::make_pair( 0.0L, 0.0L ); }

	const long double mean = sum / count;
	const long double variance = (square_sum / count) - (mean * mean);

	assert( mean >= 0 );
	assert( variance >= 0 );

	return ::std::make_pair( mean, variance );
}
