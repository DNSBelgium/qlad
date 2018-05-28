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

#include <getopt.h>
#include <iostream>
#include <cstdlib>
#include <sys/stat.h>
#include <unistd.h>
#include <cassert>
#include <cstdlib>
#include <cstring>

#include "default_settings.h"
#include "pcap_defines.h"
#include "Settings.h"

static unsigned shift_one( unsigned i ) {
	assert( static_cast<unsigned>(1 << i) );
	return 1 << i;
}

/* So that we can detect when it gets set more than once. */
static const char *file_stdin = PCAP_STDIN;

const char * const policyTypeNames[3] =
  { "srcIP", "dstIP", "qname" };

Settings::Settings( int argc, char *argv[] ) :
  window_size( WINDOW_SIZE_DEFAULT ),
  detection_interval( DETECTION_INTERVAL_DEFAULT ),
  detection_threshold( DETECTION_TRESHOLD_DEFAULT ),
  sketch_count( SKETCH_COUNT_DEFAULT ),
  hash_count( HASH_COUNT_DEFAULT ),
  aggregation_count( AGGREGATION_COUNT_DEFAULT ),
  gnuplot_anomalies_dir( NULL ),
#ifdef GNUPLOT_INTERMED
  gnuplot_intermediate_dir( NULL ),
#endif
  aggregate( shift_one ),
  file( file_stdin ),
  filter( PCAP_FILTER_NONE ),
  thread_count( sysconf(_SC_NPROCESSORS_ONLN) ),
  analysed_parameter( ANALYSED_GAMMA_PARAMETER ),
  policy( ANALYSIS_POLICY )
{
	/* This is a hack not to have to duplicate all the member variable
	 * initializations. To be replaced with constructor delegation once we
	 * switch to C++0x. Note: it's not yet supported in gcc 4.6. */
	if ( argv != NULL )
		parse( argc, argv );
}
/* ------------------------------------------------------------------------- */
static struct option long_opts[] = {
	{"help", no_argument, NULL, 'h'},
	{"filter-queries", no_argument, NULL, 'q'},
	{"filter-replies", no_argument, NULL, 'r'},
	{"graph-anomalies", required_argument, NULL, 'g'},
#ifdef GNUPLOT_INTERMED
	{"graph-intermediate", required_argument, NULL, 'G'},
#endif
	{"window-size", required_argument, NULL, 'w'},
	{"detection-interval", required_argument, NULL, 'i'},
	{"input-file", required_argument, NULL, 'f'},
	{"detection-threshold", required_argument, NULL, 't'},
	{"hash-count", required_argument, NULL, 'c'},
	{"sketch-count", required_argument, NULL, 's'},
	{"aggregation-count", required_argument, NULL, 'a'},
	{"thread-count", required_argument, NULL, 'T'},
	{"analysed-gamma-parameter", required_argument, NULL, 'p'},
	{"policy", required_argument, NULL, 'P'},
	{NULL, no_argument, NULL, 0}
};

#define QUOTE(x) #x
#define STR(x) QUOTE(x)

static const char *desc[] = {
	"\tDisplay this information",

	"\tUse pcap filter \"" PCAP_FILTER_DNS_QUERY "\" default is no filter",

	"\tUse pcap filter \"" PCAP_FILTER_DNS_RESPONSE
	"\" default is no filter",

	"\tWrite gnuplot files of detected anomalies into given directory, "
	"default is disabled",

#ifdef GNUPLOT_INTERMED
	"\tWrite gnuplot files containing intermediate data plots into given "
	"directory, default is disabled",
#endif

	"\tTime span of the analysed traffic (seconds, default is "
	STR(WINDOW_SIZE_DEFAULT) "s, minimum is\n\t" STR(WINDOW_SIZE_MIN) ")",

	"\tTime between analyses (seconds, default is "
	STR(DETECTION_INTERVAL_DEFAULT) "s, minimum is\n\t"
	STR(DETECTION_INTERVAL_MIN) ")",

	"\tInput file in pcap(tcpdump) format ('-' for stdin, the default)",

	"\tSketch distance limit for anomaly (float, default is "
	STR(DETECTION_TRESHOLD_DEFAULT) ")",

	"\tNumber of hash iterations to do (integer, default is "
	STR(HASH_COUNT_DEFAULT) ", minimum is " STR(HASH_COUNT_MIN) ")",

	"\tNumber of sketches to divide the traffic into (integer, default is "
	STR(SKETCH_COUNT_DEFAULT) ",\n\tminimum is " STR(SKETCH_COUNT_MIN) ")",

	"\tNumber of time aggregations to use (integer, default is "
	STR(AGGREGATION_COUNT_DEFAULT) ", must fit the interval <"
	STR(AGGREGATION_COUNT_MIN) ", " STR(AGGREGATION_COUNT_MAX) ">)",

	"\tNumber of threads to be launched (integer, by default equals "
	"the number of on-line processors",

	"\tSelects whether to analyse the <shape> or the <scale> or <both> "
	"of the computed Gamma distribution parameters. (string, default is "
	ANALYSED_GAMMA_PARAMETER_NAME_STR ")" ,

	"\tSelects whether to base the analysis on the <srcIP> or the <dstIP> "
	"or <qname> policy. (string, default is " ANALYSIS_POLICY_NAME_STR ")",

};

static const char *arg_str[] = { "", "=<arg>", "[=<arg>]" };

static void print_help( const char *prog_name )
{
	::std::cout << prog_name << "\nOptions:" << ::std::endl;
	for (unsigned i = 0; i < sizeof(desc) / sizeof(char*); ++i) {
		::std::cout
		  << "-" << static_cast<char>( long_opts[i].val ) << "\n--"
		  << long_opts[i].name << arg_str[long_opts[i].has_arg] << "\n"
		  << desc[i] << "\n" << ::std::endl;
	}
}
/* ------------------------------------------------------------------------- */
void Settings::parse( int argc, char *argv[] )
{

	char * err_pos;

	signed char c;
	while ((c = getopt_long(
	  argc, argv, "-w:i:t:f:s:c:a:hqrg:"
#ifdef GNUPLOT_INTERMED
	  "G:"
#endif
	  "T:p:P:", long_opts, NULL )) != -1)
	{
		struct stat file_info;

		switch (c)
		{
		case 'w':
			window_size = strtoul(optarg, &err_pos, 10);
			if ((*err_pos != '\0') ||
			    (static_cast<signed>(window_size) < 0)) {
				::std::cerr <<
				  "invalid window size parameter\n";
				exit(1);
			}
			break;

		case 'i':
			detection_interval = strtoul(optarg, &err_pos, 10);
			if ((*err_pos != '\0') ||
			    (static_cast<signed>(detection_interval) < 0)) {
				::std::cerr <<
				  "invalid detection interval parameter\n";
				exit(1);
			}
			break;

		case 't':
			detection_threshold = strtof(optarg, &err_pos);
			if ((*err_pos != '\0') ||
			    (detection_threshold < 0.0)) {
				::std::cerr <<
				  "invalid detection threshold parameter\n";
				exit(1);
			}
			break;

		case 1: /* Non-option arguments. That's what that - in
			   optstring does. */
		case 'f':
			if ( file != file_stdin ) {
				::std::cerr << "Warning: only the last input "
				  "will be used.\n";
			}
			file = optarg;
			break;

		case 's':
			sketch_count = strtoul(optarg, &err_pos, 10);
			if ((*err_pos != '\0') ||
			    (static_cast<signed>(sketch_count) < 0)){
				::std::cerr <<
				  "invalid sketch count parameter\n";
				exit(1);
			}
			break;

		case 'c':
			hash_count = strtoul(optarg, &err_pos, 10);
			if ((*err_pos != '\0') ||
			    (static_cast<signed>(hash_count) < 0)) {
				::std::cerr <<
				  "invalid hash count parameter\n";
				exit(1);
			}
			break;

		case 'a':
			aggregation_count = strtoul(optarg, &err_pos, 10);
			if ((*err_pos != '\0') ||
			    (static_cast<signed>(aggregation_count) < 0)) {
				::std::cerr <<
				  "invalid aggregation count parameter\n";
				exit(1);
			}
			break;

		case 'q':
			filter = PCAP_FILTER_DNS_QUERY;
			break;

		case 'r':
			filter = PCAP_FILTER_DNS_RESPONSE;
			break;

		case 'g':
			if ( ( stat( optarg, &file_info ) == 0 ) &&
			     S_ISDIR( file_info.st_mode ) ) {
				if ( gnuplot_anomalies_dir != NULL ) {
					::std::cerr <<
					  "Warning: overriding directory " <<
					  gnuplot_anomalies_dir <<
					  " in favour of " << optarg <<
					  ::std::endl;
				}
				gnuplot_anomalies_dir = optarg;
			} else {
				::std::cerr << "Warning: " << optarg <<
				  " does not exist or is not a directory; ";
				if ( gnuplot_anomalies_dir == NULL ) {
					::std::cerr <<
					  "no anomaly graphs will be "
					  "generated\n";
				} else {
					::std::cerr <<
					  "anomaly graphs will be generated "
					  "into directory " <<
					  gnuplot_anomalies_dir << ::std::endl;
				}
			}
			break;

#ifdef GNUPLOT_INTERMED
		case 'G':
			if ( ( stat( optarg, &file_info ) == 0) &&
			     S_ISDIR( file_info.st_mode) ) {
				if ( gnuplot_intermediate_dir != NULL ) {
					::std::cerr <<
					  "Warning: overriding directory " <<
					  gnuplot_intermediate_dir <<
					  " in favour of " << optarg <<
					  std::endl;
				}
				gnuplot_intermediate_dir = optarg;
			} else {
				::std::cerr << "Warning: " << optarg <<
				  " does not exist or is not a directory; ";
				if ( gnuplot_intermediate_dir == NULL ) {
					::std::cerr <<
					  "no intermediate graphs will be "
					  "generated\n";
				} else {
					::std::cerr <<
					  "intermediate graphs will be "
					  "generated into directory " <<
					  gnuplot_intermediate_dir <<
					  ::std::endl;
				}
			}
			break;
#endif

		case 'T' :
			thread_count = strtoul(optarg, &err_pos, 10);
			if ((*err_pos != '\0') ||
			    (static_cast<signed>(thread_count) < 1)) {
				::std::cerr <<
				  "invalid thread count parameter\n";
				exit(1);
			}
			break;

		case 'p' :
			if ( strncmp( optarg, "shape", 6 ) == 0 ) {
				analysed_parameter =
				  GammaParameters::gammaShape;
			} else if ( strncmp( optarg, "scale", 6 ) == 0 ) {
				analysed_parameter =
				  GammaParameters::gammaScale;
			} else if ( strncmp( optarg, "both", 5 ) == 0 ) {
				analysed_parameter =
				  GammaParameters::gammaBoth;
			} else {
				::std::cerr
				  << "passed unknown Gamma parameter name\n";
				exit(1);
			}
			break;

		case 'P' :
			if ( strncmp( optarg, "srcIP", 6 ) == 0) {
				policy = srcIP;
			} else if ( strncmp( optarg, "dstIP", 6 ) == 0) {
				policy = dstIP;
			} else if ( strncmp( optarg, "qname", 6 ) == 0) {
				policy = queryName;
			} else {
				::std::cerr
				  << "passed unknown policy name\n";
				exit(1);
			}
			break;

		case 'h':
		default:
			print_help( argv[0] );
			exit( 1 );
		}
	}
}
/* ------------------------------------------------------------------------- */
bool Settings::isValid() const
{
	bool ok = true;
	ok = ok && window_size >= WINDOW_SIZE_MIN;
	ok = ok && detection_interval >= DETECTION_INTERVAL_MIN;
	ok = ok && sketch_count >= SKETCH_COUNT_MIN;
	ok = ok && hash_count >= HASH_COUNT_MIN;
	ok = ok && aggregation_count >= AGGREGATION_COUNT_MIN;
	ok = ok && aggregation_count <= AGGREGATION_COUNT_MAX;
	ok = ok && thread_count >= 1;
	return ok;
}
