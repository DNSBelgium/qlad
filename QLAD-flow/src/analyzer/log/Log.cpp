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

#include <vector>
#include <cstdio>
#include <stdint.h>
#include <cassert>
#include <syslog.h>
#include <cstring>
#include <cstdarg>

#include "Log.h"
#include "sync/Mutex.h"
#include "sync/MutexLocker.h"


#define facility_levels(fid, sid) (mFacDscrs[((fid) << LOG_SRC_BITS) + sid])


/*===========================================================================*/
int Log::openFile( const char *filename, const char *mode )
/*===========================================================================*/
{
	MutexLocker m( mGuard );

	FILE * of = fopen(filename, mode);
	if ( of == NULL ) { return -1; }
	mFiles.push_back( of );
	for ( int i = 0; i < (1 << LOG_SRC_BITS); ++i)
		{ mFacDscrs.push_back( 0 ); }
	return LOGF_FILE + mFiles.size() - 1;
}


/*===========================================================================*/
uint32_t Log::levels( int facility, int source )
/*===========================================================================*/
{
	MutexLocker m( mGuard );

	assert((facility >= 0) &&
	       (static_cast<unsigned>(facility) < mFacDscrs.size()));
	assert((source >= 0) && (source < (1 << LOG_SRC_BITS)));

	if ((facility >= 0) &&
	    (static_cast<unsigned>(facility) < mFacDscrs.size()) &&
	    (source >= 0) &&
	    (static_cast<unsigned>(source) < (1 << LOG_SRC_BITS))) {
		return facility_levels(facility, source);
	} else {
		return -1;
	}
}


/*===========================================================================*/
int Log::levelsSet( int facility, int source, uint8_t levels )
/*===========================================================================*/
{
	MutexLocker m( mGuard );

	assert((facility >= 0) &&
	       (static_cast<unsigned>(facility) < mFacDscrs.size()));
	assert((source >= 0) && (source < (1 << LOG_SRC_BITS)));

	if ((facility >= 0) &&
	    (static_cast<unsigned>(facility) < mFacDscrs.size()) &&
	    (source >= 0) &&
	    (static_cast<unsigned>(source) < (1 << LOG_SRC_BITS))) {
		if ( source != LOGS_ANY ) {
			facility_levels(facility, source) = levels;
		} else {
			for ( int i = 0; i < LOGS_ANY; ++i ) {
				facility_levels(facility, i) = levels;
			}
		}
		return 0;
	} else {
		return -1;
	}
}


/*===========================================================================*/
int Log::levelsAdd( int facility, int source, uint8_t levels )
/*===========================================================================*/
{
	MutexLocker m( mGuard );

	assert((facility >= 0) &&
	       (static_cast<unsigned>(facility) < mFacDscrs.size()));
	assert((source >= 0) && (source < (1 << LOG_SRC_BITS)));

	if ((facility >= 0) &&
	    (static_cast<unsigned>(facility) < mFacDscrs.size()) &&
	    (source >= 0) &&
	    (static_cast<unsigned>(source) < (1 << LOG_SRC_BITS))) {
		if ( source != LOGS_ANY ) {
			facility_levels(facility, source) |= levels;
		} else {
			for ( int i = 0; i < LOGS_ANY; ++i ) {
				facility_levels(facility, i) |= levels;
			}
		}
		return 0;
	} else {
		return -1;
	}
}


/*===========================================================================*/
int Log::log( int source, int level, const char * msg, ... )
/*===========================================================================*/
{
	MutexLocker m( mGuard );

	assert((source >= 0) && (source < (1 << LOG_SRC_BITS)));
	assert((level >= 0) && (level < 8));

#define BUF_SIZE 2048

	/* log message buffer */
	char sbuf[BUF_SIZE];
	char *buf = sbuf;
	size_t buffree = BUF_SIZE - 1;

	/* prefix eror level */
	const char *prefix = "";
	switch ( level )
	{
		case LOG_EMERG :   prefix = "emergency: "; break;
		case LOG_ALERT :   prefix = "alert: ";     break;
		case LOG_CRIT :    prefix = "critical: ";  break;
		case LOG_ERR :     prefix = "error: ";     break;
		case LOG_WARNING : prefix = "warning: ";   break;
		case LOG_NOTICE :  prefix = "notice: ";    break;
		case LOG_INFO :    prefix = "info: ";      break;
		case LOG_DEBUG :   prefix = "debug: ";     break;
		default :          return -1;              break;
	}

	/* prepend prefix */
	int preflen = strlen(prefix);
	strncpy(buf, prefix, buffree);
	buf += preflen;
	buffree -= preflen;

	va_list argp;
	int ret = 0;
	va_start(argp, msg);
	ret = vsnprintf( buf, buffree, msg, argp );
	va_end(argp);

	if (ret > 0) {
		buf += ret;
		buffree -= ret;
		return _log( source, level, sbuf, buf - sbuf );
	} else if ( ret == 0 ) {
		return 0;
	} else {
		return -1;
	}

#undef BUF_SIZE
}


/*===========================================================================*/
int Log::_log( int source, int level, const char * msg, size_t msglen )
/*===========================================================================*/
{
	int ret = 0;
	FILE *stream;

	assert((source >= 0) && (source < (1 << LOG_SRC_BITS)));
	assert((level >= 0) && (level < 8));

	/* Convert lo log mask. */
	level = LOG_MASK(level);

	/* syslog */
	if ( facility_levels( LOGF_SYSLOG, source ) & level ) {
		syslog(level, "%s", msg);
		ret = msglen;
	}

	/* log streams */
	for (unsigned i = LOGF_STDERR; i < LOGF_FILE + mFiles.size(); ++i) {
		if ( facility_levels( i, source ) & level ) {
			/* select stream */
			switch (i) {
				case LOGF_STDERR :
					stream = stderr;
					break;
				case LOGF_STDOUT :
					stream = stdout;
					break;
				default :
					stream = mFiles[i - LOGF_FILE];
					break;
			}

			/* print */
			ret = fprintf( stream, "%s", msg );
			fflush(stream);
		}
	}

	if ( ret < 0 )
		{ return -1; }

	return ret;
}
