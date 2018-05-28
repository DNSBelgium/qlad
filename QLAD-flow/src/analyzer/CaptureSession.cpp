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
#include <ctime>
#include <iostream>

#include "CaptureSession.h"
#include "pcap_defines.h"

extern const unsigned char IPOffsetTable[];

CaptureSession & CaptureSession::instance()
{
	static CaptureSession static_instance;
	return static_instance;
}
/* ------------------------------------------------------------------------- */
bool CaptureSession::openOffline( const char *file, const char *filter )
{
	assert( !mInterface );

	struct bpf_program filter_program;

	char errbuff[PCAP_ERRBUF_SIZE];
	mInterface = pcap_open_offline( file, errbuff );
	if (!mInterface) {
		std::cerr << "Failed to open file " << file
			<< " " << errbuff << std::endl;
		return false;
	}

	mIPOffset = IPOffsetTable[pcap_datalink( mInterface )];
	int res = pcap_compile( mInterface, &filter_program, filter,
	  PCAP_FILTER_OPTIMIZE, PCAP_NETMASK_UNKNOWN );
	if (res) {
		std::cerr << "Failed to compile filter " << filter
		  << " " << errbuff << std::endl;
		return false;
	}

	res = pcap_setfilter( mInterface, &filter_program );

	/* pcap documentation is not exactly verbose about this, but
	 * pcap_compile makes a copy of the filter, therefore we should
	 * free our copy in all cases. */
	pcap_freecode( &filter_program );

	if (res) {
		std::cerr << "Failed to set filter " << filter
		  << " " << errbuff << std::endl;
		return false;
	}

	return true;
}
/* ------------------------------------------------------------------------- */
void CaptureSession::close()
{
	assert( mInterface );
	pcap_close( mInterface );
	mInterface = NULL;
}
/* ------------------------------------------------------------------------- */
void CaptureSession::startCapture( IStorage *storage, unsigned interval )
{
	assert( mInterface );
	SessionParams current = { storage, interval, mIPOffset };
	pcap_loop( mInterface, PCAP_INFINITE_COUNT, capture,
	  reinterpret_cast<u_char *>( &current ) );
}
/* ------------------------------------------------------------------------- */
void CaptureSession::stopCapture()
{
	assert( mInterface );
	pcap_breakloop( mInterface );
}
/* ------------------------------------------------------------------------- */
void CaptureSession::capture( u_char *arg, const pcap_pkthdr *header,
  const u_char *packet )
{
	assert( arg );
	assert( header );
	assert( packet );

	const SessionParams *params = reinterpret_cast<SessionParams*>( arg );

	static time_t start_time = header->ts.tv_sec;
	/* One packet is not statistically significant, we may ignore it. */
	if (header->ts.tv_sec >= (start_time + (time_t)params->interval) ) {
		CaptureSession::instance().stopCapture();
		start_time = header->ts.tv_sec;
		return;
	}
	/* Create copy, to free pcap buffer */
	const IStorage::PacketData data(
	  reinterpret_cast<const char *>( packet ) + params->offset,
	  header->caplen - params->offset );

	//ignore packet not in chronological order
	if ( header->ts.tv_sec < start_time ) return;
	params->storage->addPacket( data, header->ts.tv_sec );
}
