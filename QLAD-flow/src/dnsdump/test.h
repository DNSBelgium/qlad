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

#ifndef _TEST_H_
#define _TEST_H_

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <stdio.h>

/*!
 * @brief Test pointer for being NULL.
 *
 * Macro is a standard if check on nullnes of the pointer, prints error
 * to stderr and returns 1 to indicate error.
 */
#define TEST_NOT_NULL( subject, task, error )\
	if (subject == NULL) { \
		fprintf(stderr, NO_CAN_DO, task, error ); \
		return 1; \
	} else (void)0

/*!
 * @brief Test value for being not 0.
 *
 * Macro is a standard zero check on return value, prints error
 * to stderr and returns 1 to indicate error.
 */
#define TEST_ERROR( subject, task, error )\
	if (subject != 0) { \
		fprintf(stderr, NO_CAN_DO_ERR, task, subject, error ); \
		return 1; \
	} else (void)0

/*! Used in TEST_NOT_NULL macro */
#define NO_CAN_DO "%s failed because: %s\n"
/*! Used in TEST_ERROR macro */
#define NO_CAN_DO_ERR "%s failed because(%d): %s\n"

#endif /* _TEST_H_ */
