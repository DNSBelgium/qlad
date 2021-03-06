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

#define PCAP_INFINITE_COUNT -1
#define PCAP_STDOUT "-"
#define PCAP_STDIN "-"

#define PCAP_FILTER_DNS_RESPONSE "udp src port 53"
#define PCAP_FILTER_DNS_QUERY "udp dst port 53 and udp[10:2] & 0x8000 = 0"
#define PCAP_FILTER_NONE ""
#define PCAP_FILTER_OPTIMIZE 1
