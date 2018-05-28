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

#include <cmath>
#include <cassert>
#include <cstdlib>

#include "statistics.h"
#include "log/Log.h"

/* ------------------------------------------------------------------------- */
long double Statistics::getMahalanobisDistance(
  const ::std::vector<GammaDistribution::Params> &referenceMean,
  const ::std::vector<GammaDistribution::Params> &referenceVariance,
  const ::std::vector<long double> &referenceCovariance,
  const ::std::vector<GammaDistribution::Params> &parameters,
  const GammaParameters::type analysed_parameter
)
{
	size_t size = parameters.size();

	assert( referenceMean.size() == size );
	assert( referenceVariance.size() == size );

	unsigned i;

	/* check whether at least two aggregation levels produce valid data */
	for (i = 0; (i < size) && parameters[i].isValid(); ++i);
#ifdef DEBUG
	if ( i != size ) {
		GlobalLog.logAnalyzerDebug(
		  "adjusting aggregation level from %lu to %u\n", size, i);
	}
#endif
	size = i;
	if ( size < 2) {
		::std::cerr << "used aggregation level too low, aborting\n";
		exit(1);
	}

	long double sum = 0;
	for (i = 0; i < size; ++i) {
		/* mean and analysed should be valid parameters. */
		assert( parameters[i].isValid() );
		assert( referenceMean[i].isValid() );

		/*
		 * variance does not have to be a valid parameter pair
		 * i.e. equal parameters in all sketches produce zero variance
		 */
		assert( referenceVariance[i].shape() >= 0 );
		assert( referenceVariance[i].scale() >= 0 );

		/*
		 * dif(v)    == v - mean(v)
		 * |v|       -- vector or matrix
		 * |v| ** -1 -- inverse matrix
		 */

		long double dist;
		if ( analysed_parameter == GammaParameters::gammaShape ) {
			/*
			 * |dif(sh)| * ( |var(sh)| ** -1 ) * |dif(sh)|
			 * ==
			 * dif(sh) * dif(sh) / var(sh)
			 */
			dist =
			  ((parameters[i] - referenceMean[i]) ^ 2).shape();
			if (dist > 0) {
				assert( referenceVariance[i].shape() > 0 );
				dist /= referenceVariance[i].shape();
			}
		} else if (analysed_parameter == GammaParameters::gammaScale) {
			/*
			 * |dif(sc)| * ( |var(sc)| ** -1 ) * |dif(sc)|
			 * ==
			 * dif(sc) * dif(sc) / var(sc)
			 */
			dist =
			  ((parameters[i] - referenceMean[i]) ^ 2).scale();
			if (dist > 0) {
				assert( referenceVariance[i].scale() > 0 );
				dist /= referenceVariance[i].scale();
			}
		} else /* both parameters analysed together */ {
			/* building covariance matrix */
			long double c00, c01, /* var(sh),     cov(sh, sc) */
			            c10, c11; /* cov(cs, sh), var(sc)     */
			c00 = referenceVariance[i].shape();
			c01 = c10 = referenceCovariance[i];
			c11 = referenceVariance[i].scale();
			/* inverting the covariance matrix */
			long double det = c00*c11 - c01*c10,
			            aux = c00;
			/* non-zero determinant == has an inverse */
			assert( det != 0.0 );
			c00 =   c11 / det; c01 = - c01 / det;
			c10 = - c10 / det; c11 =   aux / det;
			/* computing Mahalanobis distance */
			GammaDistribution::Params dist_tmp =
			  parameters[i] - referenceMean[i];
			/*
			 * |c00 c01| == |  var(sh)   cov(sh, sc)| ** -1
			 * |c10 c11|    |cov(cs, sh)   var(sc)  |
			 *
			 * |dif(sh) dif(sc)| * |c00 c01| * |dif(sh)|
			 *                     |c10 c11|   |dif(sc)|
			 */
			dist =
			  (dist_tmp.shape()*c00 + dist_tmp.scale()*c10) *
			   dist_tmp.shape() +
			  (dist_tmp.shape()*c01 + dist_tmp.scale()*c11) *
			   dist_tmp.scale();
			/*
			 * don't know whether it would appropriate to set
			 * dist /= 2
			 * in order to 'normalize' with single parameter
			 * evaluation
			 */
		}
		assert( dist >= 0 );
		sum += dist;
	}
	sum /= size;
	assert( sum >= 0 );
	return sqrt( sum );
}
