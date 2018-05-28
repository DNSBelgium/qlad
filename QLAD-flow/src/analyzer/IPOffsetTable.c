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

/*!
 * @brief Link header length table.
 *
 * See pcap manpage about link types.
 */
const unsigned char IPOffsetTable[] =
{
	[DLT_LOOP] = 4,
	[DLT_NULL] = 4,    /* BSD LoopBack       */
	[DLT_EN10MB] = 14, /* EthernetII, I hope */
	[DLT_RAW] = 0,     /* RAW IP             */
	[DLT_PFLOG] = 28,  /* BSD pflog          */
/*  NOT YET SUPPORTED
	[DLT_IEEE802] =
	[DLT_ARCNET] =
	[DLT_SLIP] =
	[DLT_PPP] =
	[DLT_FDDI] =
	[DLT_ATM_RFC1483] =
	[DLT_PPP_SERIAL] =
	[DLT_PPP_ETHER] =
	[DLT_C_HDLC] =
	[DLT_IEEE802_11] =
	[DLT_FRELAY] =
	[DLT_LINUX_SLL] =
	[DLT_LTALK] =
	[DLT_PRISM_HEADER] =
	[DLT_IP_OVER_FC] =
	[DLT_SUNATM] =
	[DLT_IEEE802_11_RADIO] =
	[DLT_ARCNET_LINUX] =
	[DLT_LINUX_IRDA] =
*/
};
