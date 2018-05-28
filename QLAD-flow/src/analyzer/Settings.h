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

#include <cstddef>
#include "statistics/GammaParameters.h"

/*!
 * @brief Convenience policy naming.
 */
typedef enum {
	srcIP     = 0,
	dstIP     = 1,
	queryName = 2
} policyType;

/*!
 * @brief Policy names.
 */
extern const char * const policyTypeNames[];

/*!
 * @class Settings Settings.h "Settings.h"
 * @brief Parameters for traffic capture and statistical analysis.
 */
class Settings
{
public:
	/*! @brief Time span of analysed communication. */
	size_t window_size;
	/*! @brief Time between analyses. */
	size_t detection_interval;

	/*! @brief Minimum distance to consider identifiers anomalous. */
	float detection_threshold;

	/*! @brief Number of sketches to hold analysed traffic. */
	unsigned sketch_count;
	/*! @brief Number of hash iterations to perform. */
	unsigned hash_count;
	/*! @brief Number of time aggregation to describe every sketch. */
	unsigned aggregation_count;
	/*! @brief Directory to store gnuplot files of detected anomalies */
	const char *gnuplot_anomalies_dir;
#ifdef GNUPLOT_INTERMED
	/*! @brief Directory to store gnuplot files containing intermediate
	 *  data plots */
	const char *gnuplot_intermediate_dir;
#endif

	/*! @brief Function to use for index to time conversion. */
	unsigned (*aggregate)( unsigned );

	/*! @brief Pcap file to use. */
	const char *file;

	/*! @brief Pcap filter text. */
	const char *filter;

	/*! @brief Number of threads. */
	unsigned thread_count;

	/*! @brief Analysed Gamma distribution parameter */
	GammaParameters::type analysed_parameter;

	/*! @brief Analysis to be used. */
	policyType policy;

	/*! @brief Assigns default values. */
	Settings( int argc = 0, char *argv[] = NULL );
	/*! @brief Parses command line parameters. */
	void parse( int argc, char *argv[] );
	/*! @brief Checks Settings against a set of requirements. */
	bool isValid() const;
};
