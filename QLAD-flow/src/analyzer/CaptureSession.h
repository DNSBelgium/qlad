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

#include <pcap.h>

#include "IStorage.h"


/*!
 * @class CaptureSession CaptureSession.h "CaptureSession.h"
 * @brief Pcap API wrapper class.
 *
 * CaptureSession is a singleton providing interface for currently
 * prepared/running capture from pcap capture file.
 */
class CaptureSession
{
public:
	/*!
	 * @brief Gets global instance.
	 * @return Reference to global instance
	 *
	 * Standard singleton function to access the instance.
	 */
	static CaptureSession & instance();

	/*!
	 * @brief Attempts to open file as pcap capture file.
	 * @param file Path to the file to open
	 * @return true on success, false on failure
	 *
	 * Initializes mInterface (expects it to be uninitialized) and
	 * mIPOffset based on the datalink type of the mInterface.
	 * On error returns false and prints human readable text on stderr.
	 * If the session is already opened the results are undefined.
	 */
	bool openOffline( const char *file, const char *filter );

	/*!
	 * @brief Closes opened session
	 *
	 * Correctly closes internal pcap handle.
	 * If the session was not opened the results are undefined.
	 */
	void close();

	/*!
	 * @brief Starts capture using the provided callback.
	 * @param storage Will use this storage to store packets
	 * @param interval Time span of the communication to capture
	 *
	 * Wrapper for pcap_loop with infinite count.
	 */
	void startCapture( IStorage *storage, unsigned interval );

	/*!
	 * @brief Stops running capture.
	 *
	 * Wrapper for pcap_breakloop.
	 */
	void stopCapture();

	/*!
	 * @brief Checks whether starting a capture is possible.
	 * @return true if the session is properly opened and there is data
	 * to be read, false otherwise;
	 *
	 * Checks whether mInterface is not NULL, and there is still
	 * something to get from the opened file.
	 */
	bool canCapture()
		{ return mInterface && !feof( pcap_file( mInterface ) ); };

protected:
	/*! @brief Pointer to pcap structure used for capture */
	pcap_t *mInterface;
	/*! @brief Offset of the IP header, in bytes */
	unsigned mIPOffset;

	/*! @brief Parameters used in one capture session */
	struct SessionParams {
		/*! @brief Place to store the packets. */
		IStorage * storage;
		/*! @brief Max time between the first and the last packet. */
		unsigned interval;
		/*! @brief Size of the link header. */
		unsigned offset;
	};

	/*!
	 * @brief Function to call on every packet, follows pcap interface.
	 * @param arg User structure (pointer to SessionParams)
	 * @param header Pointer to the pcap header
	 *               (packet time-stamp and length)
	 * @param data Pointer to the captured packet data (pcap buffer)
	 *
	 * Reads packet data to IStorage::PacketData.
	 * Checks time and calls stopCapture() if arrival time of a new packet
	 * is later than allowed by interval parameter. The last packet
	 * is lost.
	 */
	static void capture( u_char *arg, const pcap_pkthdr *header,
	  const u_char *data );

	/*! @brief Default contructor, zeroes members. */
	CaptureSession(): mInterface( NULL ), mIPOffset( 0 ) {};

private:
	/*! @brief Copy-constructor, FORBIDDEN */
	CaptureSession( const CaptureSession & );

	/*! @brief FORBIDDEN operator */
	CaptureSession & operator = ( const CaptureSession & );
};
