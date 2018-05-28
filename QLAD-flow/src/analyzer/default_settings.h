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

#include "Settings.h"
#include "statistics/GammaParameters.h"

/* seconds */
#define WINDOW_SIZE_MIN 5
#define WINDOW_SIZE_DEFAULT 300  // analyse 5 minutes of data

#define DETECTION_INTERVAL_MIN 1
#define DETECTION_INTERVAL_DEFAULT 150  // analyse every 150 seconds

#define SKETCH_COUNT_MIN 1
#define SKETCH_COUNT_DEFAULT 16

#define HASH_COUNT_MIN 1
#define HASH_COUNT_DEFAULT 12

#define DETECTION_TRESHOLD_DEFAULT 0.8

/* seconds - really? */
#define AGGREGATION_COUNT_MIN 1
#define AGGREGATION_COUNT_DEFAULT 8
#define AGGREGATION_COUNT_MAX 31

#define ANALYSED_GAMMA_PARAMETER GammaParameters::gammaScale
#define ANALYSED_GAMMA_PARAMETER_NAME_STR "scale"

#define ANALYSIS_POLICY srcIP
#define ANALYSIS_POLICY_NAME_STR "srcIP"
