/*
 * QLAD - An anomaly detection system for DNS traffic
 * Copyright (C) 2017 DNS Belgium
 *
 * This file is part of QLAD.
 *
 * QLAD is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QLAD is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QLAD.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

module.exports = function(props) {
  return (
    <div>
    <h1>Data model</h1>

    <h2>Staging and warehouse</h2>

    <p>
    Every schema contains at least two tables, a staging table and a warehouse
    table. The staging table is the table where new network data gets appended to.
    Because new data arrives in relatively small batches (5 minute pcap files) it
    is not possible to create Parquet files with the optimal size. That is why all
    new data is written into small(er) Parquet files and are appended to the staging
    table. The data from the staging table is moved to the warehouse table at night,
    this move operation combines the smaller Parquet files into a smaller number of
    larger files.
    </p>

    <h2 id="partitioning">Partitioning</h2>

    <p>
    The staging and warehouse tables use a partitioning schema to divide the data
    into seperate partition. These partitions can be used in SQL queries to indicate
    which data files must be used when executing the SQL query, this process is
    called "partition pruning". The partition schema contains 4 columns.
    </p>

    <Table>
    <thead>
      <TableRow>
        <th>Column</th>
        <th>Description</th>
      </TableRow>
    </thead>
    <tbody>
      <TableRow>
        <td>year</td>
        <td>The capture year</td>
      </TableRow>
      <TableRow>
        <td>month</td>
        <td>The capture month</td>
      </TableRow>
      <TableRow>
        <td>day</td>
        <td>The capture day</td>
      </TableRow>
      <TableRow>
        <td>server</td>
        <td>The destination server</td>
      </TableRow>
    </tbody>
    </Table>

    <p>
    The following example SQL query only analyzes data for server "ns1.dns.nl"
    that was captured on 05-12-2015. All other data in the table is skipped.
    Partitioning functions as an index to enable fast data lookups.
    </p>

    <pre><code>select qname
    from dns.queries
    where year=2015 and month=12 and day=5 and server="ns1.dns.nl"
    limit 10
    </code></pre>

    <h2 id="dns">DNS</h2>

    <p>
    For performance reasons the DNS request and response packets are joined
    into a single row, to avoid having to do expensive join operations with large
    tables. Besides DNS information there is also IP and TCP/UDP and meta
    information added to each row.
    </p>

    <p>
    The table below contains all available columns, the protocol indicates
    the network protocol the column data is exTableRowacted from. The type can
    be either request, response or meta. The meta type is used for columns that
    contain data that is not directly exTableRowacted from network packet data.
    Meta data is descriptive data about the network data, such as the geographical
    location for an IP address.
    </p>

    <h3 id="tables">Tables</h3>

    <ul>
      <li>Staging: used for appending new data to the database.</li>
      <li>Queries: The data warehouse table, every night the data from the previous
      day is moved from the "staging" table to the "queries" tables.</li>
    </ul>

    <h3 id="columns">Columns</h3>

    <Table className=" table table-bordered">
    <thead>
      <TableRow>
        <th>column</th>
        <th>protocol</th>
        <th>type</th>
        <th>description</th>
      </TableRow>
    </thead>
    <tbody>
      <TableRow>
      <td>id</td>
      <td>DNS</td>
      <td>query</td>
      <td>message id</td>
      </TableRow>
      <TableRow>
      <td>rcode</td>
      <td>DNS</td>
      <td>response</td>
      <td>rcode (-1 is no matching server response is found)</td>
      </TableRow>
      <TableRow>
      <td>opcode</td>
      <td>DNS</td>
      <td>query</td>
      <td>opcode</td>
      </TableRow>
      <TableRow>
      <td>query_ts</td>
      <td>-</td>
      <td>META</td>
      <td>packet timestamp in UTC, uses TIMESTAMP datatype</td>
      </TableRow>
      <TableRow>
      <td>unixtime</td>
      <td>-</td>
      <td>META</td>
      <td>packet timestamp, seconds since January 1, 1970, UTC, BIGINT datatype</td>
      </TableRow>
      <TableRow>
      <td>time</td>
      <td>-</td>
      <td>META</td>
      <td>milliseconds since January 1, 1970, 00:00:00 UTC</td>
      </TableRow>
      <TableRow>
      <td>qname</td>
      <td>DNS</td>
      <td>request</td>
      <td>qname from request</td>
      </TableRow>
      <TableRow>
      <td>qtype</td>
      <td>DNS</td>
      <td>request</td>
      <td>qtype from request</td>
      </TableRow>
      <TableRow>
      <td>domainname</td>
      <td>DNS</td>
      <td>META</td>
      <td>secondlevel domainname (exTableRowacted from qname)</td>
      </TableRow>
      <TableRow>
      <td>labels</td>
      <td>DNS</td>
      <td>META</td>
      <td>count of the number of qname labels</td>
      </TableRow>
      <TableRow>
      <td>src</td>
      <td>IP</td>
      <td>request</td>
      <td>source IP address</td>
      </TableRow>
      <TableRow>
      <td>dst</td>
      <td>IP</td>
      <td>request</td>
      <td>destination IP address</td>
      </TableRow>
      <TableRow>
      <td>ttl</td>
      <td>IP</td>
      <td>request</td>
      <td>TTL</td>
      </TableRow>
      <TableRow>
      <td>frag</td>
      <td>IP</td>
      <td>request</td>
      <td>fragment count</td>
      </TableRow>
      <TableRow>
      <td>ipv</td>
      <td>IP</td>
      <td>request</td>
      <td>IP version, 4 or 6</td>
      </TableRow>
      <TableRow>
      <td>prot</td>
      <td>IP</td>
      <td>request</td>
      <td>protocol, 6(TCP) or 17(UDP)</td>
      </TableRow>
      <TableRow>
      <td>srcp</td>
      <td>UDP/TCP</td>
      <td>request</td>
      <td>source port</td>
      </TableRow>
      <TableRow>
      <td>dstp</td>
      <td>UDP/TCP</td>
      <td>request</td>
      <td>destination port</td>
      </TableRow>
      <TableRow>
      <td>udp_sum</td>
      <td>UDP</td>
      <td>request</td>
      <td>checksum for the UDP request</td>
      </TableRow>
      <TableRow>
      <td>dns_len</td>
      <td>DNS</td>
      <td>request</td>
      <td>length dns request excluding ip/tcp/udp headers</td>
      </TableRow>
      <TableRow>
      <td>dns_res_len</td>
      <td>DNS</td>
      <td>response</td>
      <td>length dns response excluding ip/tcp/udp headers</td>
      </TableRow>
      <TableRow>
      <td>len</td>
      <td>DNS/UDP/TCP</td>
      <td>request</td>
      <td>length of the request packet including all headers</td>
      </TableRow>
      <TableRow>
      <td>res_len</td>
      <td>DNS/UDP/TCP</td>
      <td>response</td>
      <td>length of the response packet including all headers</td>
      </TableRow>
      <TableRow>
      <td>aa</td>
      <td>DNS</td>
      <td>response header</td>
      <td>Authoritative Answer</td>
      </TableRow>
      <TableRow>
      <td>tc</td>
      <td>DNS</td>
      <td>response header</td>
      <td>TableRowuncation</td>
      </TableRow>
      <TableRow>
      <td>rd</td>
      <td>DNS</td>
      <td>query header</td>
      <td>Recursion Desired</td>
      </TableRow>
      <TableRow>
      <td>ra</td>
      <td>DNS</td>
      <td>response header</td>
      <td>Recursion Available</td>
      </TableRow>
      <TableRow>
      <td>z</td>
      <td>DNS</td>
      <td>query header</td>
      <td>Zero</td>
      </TableRow>
      <TableRow>
      <td>ad</td>
      <td>DNS</td>
      <td>response header</td>
      <td>Authenticated data (DNSSEC)</td>
      </TableRow>
      <TableRow>
      <td>cd</td>
      <td>DNS</td>
      <td>query header</td>
      <td>Checking Disabled (DNSSEC)</td>
      </TableRow>
      <TableRow>
      <td>ancount</td>
      <td>DNS</td>
      <td>response header</td>
      <td>Answer Record Count</td>
      </TableRow>
      <TableRow>
      <td>arcount</td>
      <td>DNS</td>
      <td>response header</td>
      <td>Additional Record Count</td>
      </TableRow>
      <TableRow>
      <td>nscount</td>
      <td>DNS</td>
      <td>response header</td>
      <td>Authority Record Count</td>
      </TableRow>
      <TableRow>
      <td>qdcount</td>
      <td>DNS</td>
      <td>query header</td>
      <td>Question Count</td>
      </TableRow>
      <TableRow>
      <td>counTableRowy</td>
      <td>IP</td>
      <td>META</td>
      <td>counTableRowy location of the source IP address</td>
      </TableRow>
      <TableRow>
      <td>asn</td>
      <td>IP</td>
      <td>META</td>
      <td>autonomous system number of the source IP address</td>
      </TableRow>
      <TableRow>
      <td>edns_udp</td>
      <td>DNS</td>
      <td>query</td>
      <td>max UDP packet length supported by client</td>
      </TableRow>
      <TableRow>
      <td>edns_version</td>
      <td>DNS</td>
      <td>query</td>
      <td>EDNS0 version</td>
      </TableRow>
      <TableRow>
      <td>edns_do</td>
      <td>DNS</td>
      <td>query</td>
      <td>DNSSEC do-bit</td>
      </TableRow>
      <TableRow>
      <td>edns_ping</td>
      <td>DNS</td>
      <td>query</td>
      <td>EDNS0 ping option of powerdns</td>
      </TableRow>
      <TableRow>
      <td>edns_nsid</td>
      <td>DNS</td>
      <td>query</td>
      <td>name server identifier (rfc5001)</td>
      </TableRow>
      <TableRow>
      <td>edns_dnssec_dau</td>
      <td>DNS</td>
      <td>query</td>
      <td>DNSSEC Algorithm signalling, DNSSEC Algorithm Understood, (rfc6975)</td>
      </TableRow>
      <TableRow>
      <td>edns_dnssec_dhu</td>
      <td>DNS</td>
      <td>query</td>
      <td>DNSSEC Algorithm signalling, DS Hash Understoodd, (rfc6975)</td>
      </TableRow>
      <TableRow>
      <td>edns_dnssec_n3u</td>
      <td>DNS</td>
      <td>query</td>
      <td>DNSSEC Algorithm signalling, NSEC3 Hash Understood, (rfc6975)</td>
      </TableRow>
      <TableRow>
      <td>edns_client_subnet</td>
      <td>DNS</td>
      <td>query</td>
      <td>Client subnet option (draft-ietf-dnsop-edns-client-subnet-00)</td>
      </TableRow>
      <TableRow>
      <td>edns_client_subnet_asn</td>
      <td>-</td>
      <td>META</td>
      <td>asn of the client subnet</td>
      </TableRow>
      <TableRow>
      <td>edns_client_subnet_counTableRowy</td>
      <td>-</td>
      <td>META</td>
      <td>counTableRowy location of the client subnet IP address</td>
      </TableRow>
      <TableRow>
      <td>edns_other</td>
      <td>DNS</td>
      <td>query</td>
      <td>All other used EDNS0 options (concatenated as sTableRowing)</td>
      </TableRow>
      <TableRow>
      <td>time_micro</td>
      <td>-</td>
      <td>META</td>
      <td>the microseconds of the request timestamp (unixtime is rounded to seconds)</td>
      </TableRow>
      <TableRow>
      <td>resp_frag</td>
      <td>IP</td>
      <td>query</td>
      <td>the number of IP packet fragments required for the DNS response</td>
      </TableRow>
      <TableRow>
      <td>proc_time</td>
      <td>-</td>
      <td>META</td>
      <td>the number microseconds between the request and the response</td>
      </TableRow>
      <TableRow>
      <td>is_google</td>
      <td>-</td>
      <td>META</td>
      <td>TableRowue is the IP address matches one of the know Google resolver IP addresses</td>
      </TableRow>
      <TableRow>
      <td>is_opendns</td>
      <td>-</td>
      <td>META</td>
      <td>TableRowue is the IP address matches one of the know OpenDNS resolver IP addresses</td>
      </TableRow>
      <TableRow>
      <td>server_location</td>
      <td>META</td>
      <td>request</td>
      <td>location of the anycast node, only if anycast encoding is used for the file input directory</td>
      </TableRow>
      <TableRow>
      <td>year</td>
      <td>META</td>
      <td>query</td>
      <td>year part of timestamp</td>
      </TableRow>
      <TableRow>
      <td>month</td>
      <td>META</td>
      <td>query</td>
      <td>month part of timestamp</td>
      </TableRow>
      <TableRow>
      <td>day</td>
      <td>META</td>
      <td>query</td>
      <td>day part of timestamp</td>
      </TableRow>
      <TableRow>
      <td>server</td>
      <td>DNS</td>
      <td>query</td>
      <td>The name server the DNS query was sent to</td>
      </TableRow>
    </tbody>
    </Table>

    <div className="admonition-wrapper note">The query_ts atTableRowibute is much
    more efficient to use in SQL queries than the unixtime atTableRowibute.</div>

    <p>The list of Google and OpenDNS resolver IP addresses used to determine if
    an IP belongs to Google or OpenDNS, is automatically fetched every day.</p>

    <p>For more information about the DNS fields see <a href="https://www.ietf.org/rfc/rfc1035.txt">DNS RFC 1035</a>. The table column names match the RFC field names.
    For more information about possible DNS columns values see <a href="http://www.iana.nl/assignments/dns-parameters/dns-parameters.xhtml">IANA DNS parameters</a>.</p>

        </div>
  );
};
