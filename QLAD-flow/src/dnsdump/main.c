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

#include <pcap.h>
#include <stdio.h>
#include <signal.h>
#include <string.h>

#include "test.h"
#include "pcap_defines.h"

#define WRONG_PARAM_COUNT \
	"%s needs to be run with one parameter, the interface name.\n"

/*!
 * @struct capture_options
 * @brief Parameters needed to open a device.
 *
 * All paramters needed for pcap_open_live. See pcap man page for details.
 */
struct capture_options {
	char* interface;  /*!< @brief Name of the interface to capture on. */
	int snaplen;      /*!< @brief Number of bytes to capture from each packet. */
	int promisc_flag; /*!< @brief 1 if device should be set to promisc mode */
	int timeout;      /*!< @brief Miliseconds to wait for packets */
};

/*! @brief Struct capture_options initializer. */
#define DEFAULT_OPTIONS \
{ \
	NULL,  /*no default interface*/ \
	65535, /*eneough to capture most of the packets*/ \
	0,     /*no promisc*/ \
	10     /*10ms timeout*/ \
}
/* -------------------------------------------------------------------------- */
/*!
 * @struct capture_session
 * @brief Parameters needed by pcap_loop.
 *
 * All paramters needed for pcap_loop, except for the callback function. See
 * pcap man page for details.
 */
struct capture_session {
	struct capture_options options; /*!< @brief Used options.                 */
	char *outfile;                  /*!< @brief Name of the file to dump to.  */
	int count;                      /*!< @brief Number of packets to capture. */
	pcap_t *interface;              /*!< @brief pcap interface to capture on. */
} current_session = { DEFAULT_OPTIONS, PCAP_STDOUT, PCAP_INFINITE_COUNT, NULL };
/* -------------------------------------------------------------------------- */
/*!
 * @brief Singal handler that stops capture.
 * @param signum Signal number, unused
 */
void stop_loop(int signum)
{
	(void) signum;
	if (current_session.interface)
		pcap_breakloop( current_session.interface );
}
/* -------------------------------------------------------------------------- */
/*!
 * @brief The main function.
 * @param argc Argument count
 * @param argv Argument vector
 *
 * Setups capture and uses stdout as dump file.
 */
int main( int argc, char **argv )
{
	if (argc != 2)
		return fprintf(stderr, WRONG_PARAM_COUNT, *argv ), 1;

	char errbuff[PCAP_ERRBUF_SIZE];
	const struct capture_options *options = &(current_session.options);

	current_session.options.interface = argv[1];

	current_session.interface =
		pcap_open_live( options->interface, options->snaplen, options->promisc_flag,
			options->timeout, errbuff );
	TEST_NOT_NULL(current_session.interface, "Opening interface", errbuff );

	pcap_dumper_t* dumper =
		pcap_dump_open( current_session.interface, current_session.outfile );
	TEST_NOT_NULL(dumper, "Opening dumpfile", errbuff );

	struct bpf_program filter;
	int res =
		pcap_compile( current_session.interface, &filter,
			PCAP_FILTER_DNS_QUERY, PCAP_FILTER_OPTIMIZE, PCAP_NETMASK_UNKNOWN );
	TEST_ERROR(res, "Compiling filter", errbuff);

	res = pcap_setfilter( current_session.interface, &filter );
	TEST_ERROR(res, "Setting filter", errbuff);

	struct sigaction action;
	memset( &action, 0, sizeof(struct sigaction) );
	action.sa_handler = stop_loop;

	sigaction( SIGINT, &action, NULL );
	sigaction( SIGHUP, &action, NULL );
	sigaction( SIGTERM, &action, NULL );

	pcap_loop( current_session.interface, current_session.count,
		pcap_dump, (u_char *) dumper );

	pcap_dump_close( dumper );

	return 0;
}
