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

#ifndef _LOG_H_
#define _LOG_H_

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <vector>
#include <cstdio>
#include <stdint.h>
#include <cassert>
#include <syslog.h>

#include "sync/Mutex.h"
#include "sync/MutexLocker.h"

#define GlobalLog Log::globalInstance()



class Log
{
public:

	enum facility {
		LOGF_SYSLOG = 0, /*!< @brief syslog(3) facility. */
		LOGF_STDERR = 1, /*!< @brief stderr log target. */
		LOGF_STDOUT = 2, /*!< @brief stdout log target. */
		LOGF_FILE   = 3  /*!< @brief Generic unbuffered file log
		                      target. */
	};

/*! @brief Number of bits reserved for identification of the source. */
#define LOG_SRC_BITS 1
	/*! @brief Log sources. */
	enum source { /* indexing must start from 0 */
		LOGS_ANALYZER = 0,
		/*! @brief Masks any source. */
		LOGS_ANY = (1 << LOG_SRC_BITS) - 1
	}; /* Maximum of LOGS_ANY sources allowed. */

	/* syslog log levels are used */

	Log() : mFiles(), mFacDscrs(LOGF_FILE << LOG_SRC_BITS, 0)
	{
		setlogmask( LOG_UPTO(LOG_DEBUG) );
#define PROJECT_NAME "" /* TODO - make it configurable */
		openlog( PROJECT_NAME, LOG_CONS, LOG_LOCAL1 );
#undef PROJECT_NAME
	}

	~Log()
	{
		closelog();
		FileVect::iterator it;
		for (it = mFiles.begin(); it != mFiles.end(); ++it)
		{
			assert(*it != NULL);
			fclose(*it);
		}
	}

	/*!
	 * @brief Opens a file as a logging facility.
	 * @param fname File name.
	 * @param mode  Opening mode.
	 * @return -1 if could not open file, 
	 *         id of the file else.
	 */
	int openFile( const char *fname, const char *mode );

	/*! 
	 * @brief Get log levels for a given facility.
	 * @param facility Facility id.
	 * @param source   Source id. 
	 * @return -1 if error,
	 *         bits identifying log levels assigned to facility.
	 */
	uint32_t levels( int facility, int source );

	/*!
	 * @brief Set log levels according to given mask.
	 * @param facility Facility id.
	 * @param source   Source id.
	 * @param levels   Bit-masked levels to be logged.
	 * @return -1 if error,
	 *          0 else.
	 */
	int levelsSet( int facility, int source, uint8_t levels );

	/*!
	 * @brief Add additional levels according to given mask.
	 * @param facility Facility id.
	 * @param source   Source id.
	 * @param levels   Bit-masked levels to be logged.
	 * @return -1 if error,
	 *          0 else.
	 */
	int levelsAdd( int facility, int source, uint8_t levels );

	/*!
	 * @brief Log message.
	 * @param source Origin id of the message.
	 * @param level  Message urgency level.
	 * @param msg    Content of the log message - follows printf() format.
	 * @return -1 if error,
	 *          0 if message ignored,
	 *          number of written bytes else.
	 */
	int log( int source, int level, const char * msg, ... )
	  __attribute__((format(printf, 4, 5)));


	/*! @brief Access the global Log. */
	static Log & globalInstance()
		{ static Log instance; return instance; }

protected:
	Mutex mGuard; /*!< @brief Mutex to prevent simultaneous access. */

	typedef ::std::vector<FILE *> FileVect;
	FileVect mFiles; /*!< @brief List of opened files. */

	typedef ::std::vector<uint8_t> FacDscrVect;
	/*
	 * 8 syslog log levels -> 8 bits
	 * LOG_SRCS sources
	 *
	 * Example for 2 log sources:
	 *  0        1        2        3        4        5        6        7
	 * +--------+--------+--------+--------+--------+--------+--------+--
	 * | SYSLOG | SYSLOG | STDERR | STDERR | STDOUT | STDOUT | FILE1  |
	 * | SRC1   | SRC2   | SRC1   | SRC2   | SRC1   | SRC2   | SRC1   | ...
	 * | LEVELS | LEVELS | LEVELS | LEVELS | LEVELS | LEVELS | LEVELS |
	 * +--------+--------+--------+--------+--------+--------+--------+--
	 */
	FacDscrVect mFacDscrs; /*!< @brief Facility descriptors.*/

	/*!
	 * @brief Log message.
	 * @param source Origin id of the message.
	 * @param level  Message urgency level.
	 * @param msg    Logged message.
	 * @param msglen Length of the message (not including the '\0').
	 * @return -1 if error,
	 *          0 if message ignored,
	 *          number of written bytes else.
	 *
	 * @note This function does not use locking.
	 */
	int _log( int source, int level, const char * msg, size_t msglen );
};

#define logAnalyzerEmerg( msg... )  log( Log::LOGS_ANALYZER, LOG_EMERG, msg )
#define logAnalyzerAlert( msg... )  log( Log::LOGS_ANALYZER, LOG_ALERT, msg )
#define logAnalyzerCrit( msg... )   log( Log::LOGS_ANALYZER, LOG_CRIT, msg )
#define logAnalyzerErr( msg... )    log( Log::LOGS_ANALYZER, LOG_ERR, msg )
#define logAnalyzerWarn( msg... )   log( Log::LOGS_ANALYZER, LOG_WARNING, msg )
#define logAnalyzerNotice( msg... ) log( Log::LOGS_ANALYZER, LOG_NOTICE, msg )
#define logAnalyzerInfo( msg... )   log( Log::LOGS_ANALYZER, LOG_INFO, msg )
#define logAnalyzerDebug( msg... )  log( Log::LOGS_ANALYZER, LOG_DEBUG, msg )

#endif /* _LOG_H_ */
