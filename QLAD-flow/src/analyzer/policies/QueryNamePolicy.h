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

// NOTICE: this is a modified version of https://github.com/SIDN/entrada
// modified 2017-08-18 by Pieter Robberechts in context of implementing QLAD system at DNS Belgium
// use SLD instead of full qname as hash key

#pragma once

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <string>

/*!
 * @struct QueryNamePolicy QueryNamePolicy.h "QueryNamePolicy.h"
 * @brief Policy class around DNS query name.
 *
 * Provides:
 *  - id_t type that stores a query name
 *  - parsing function parseIdentifier that creates id_t from packet data
 *  - hash functions for query names
 */
struct QueryNamePolicy
{
	static const char *NAME; /*!< @brief Human readable name of the policy */
	typedef ::std::string id_t; /*!< @brief Identified by a query name */

	/*!
	 * @brief Parses packet for a query name.
	 * @param data Packet data
	 * @param size Packet size
	 * @return SLD of the first query name present in the packet, empty string if
	 * none can be parsed.
	 */
	static id_t parseIdentifier( const char *data, const size_t size );

	/*!
	 * @brief Various hash functions that use a query name
	 * @param index Hash function to use
	 * @param identifier Query name that will be hashed.
	 * @return Hashed value of a query name
	 */
	static unsigned hash( const unsigned index, const id_t &identifier );

	/*!
	 * @brief Tests identifier for validity.
	 * @param identifier Query name.
	 * @return True for nonempty query names.
	 */
	static bool isValid( const id_t &identifier ) {
		return identifier.length();
	}
};
