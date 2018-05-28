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

export const SERVERS = [
  {
    value: 'ns1.anycast.ns.dns.be',
    label: 'ns1'
  },
  {
    value: 'ns2.anycast.ns.dns.be',
    label: 'ns2'
  },
  {
    value: 'ns3.anycast.ns.dns.be',
    label: 'ns3'
  }
];


export const DNS_RCODES = [
 {
   "id": -1,
   "type": "NORESPONSE",
   "description": "No matching server response is found"
 },
 {
   "id": 0,
   "type": "NOERROR",
   "description": "DNS Query completed successfully"
 },
 {
   "id": 1,
   "type": "FORMERR",
   "description": "DNS Query Format Error"
 },
 {
   "id": 2,
   "type": "SERVFAIL",
   "description": "Server failed to complete the DNS request"
 },
 {
   "id": 3,
   "type": "NXDOMAIN",
   "description": "Domain name does not exist"
 },
 {
   "id": 4,
   "type": "NOTIMP",
   "description": "Function not implemented"
 },
 {
   "id": 5,
   "type": "REFUSED",
   "description": "The server refused to answer for the query"
 },
 {
   "id": 6,
   "type": "YXDOMAIN",
   "description": "Name that should not exist, does exist"
 },
 {
   "id": 7,
   "type": "XRRSET",
   "description": "RRset that should not exist, does exist"
 },
 {
   "id": 8,
   "type": "NOTAUTH",
   "description": "Server not authoritative for the zone"
 },
 {
   "id": 9,
   "type": "NOTZONE",
   "description": "Name not in zone"
 }
];

export const DNS_QUERY_TYPES = [
 {
   "id": 1,
   "type": "A",
   "RFC": "RFC 1035[1]",
   "description": "Address record",
   "function": "Returns a 32-bit IPv4 address, most commonly used to map hostnames to an IP address of the host, but it is also used for DNSBLs, storing subnet masks in RFC 1101, etc."
 },
 {
   "id": 28,
   "type": "AAAA",
   "RFC": "RFC 3596[2]",
   "description": "IPv6 address record",
   "function": "Returns a 128-bit IPv6 address, most commonly used to map hostnames to an IP address of the host."
 },
 {
   "id": 18,
   "type": "AFSDB",
   "RFC": "RFC 1183",
   "description": "AFS database record",
   "function": "Location of database servers of an AFS cell. This record is commonly used by AFS clients to contact AFS cells outside their local domain. A subtype of this record is used by the obsolete DCE/DFS file system."
 },
 {
   "id": 42,
   "type": "APL",
   "RFC": "RFC 3123",
   "description": "Address Prefix List",
   "function": "Specify lists of address ranges, e.g. in CIDR format, for various address families. Experimental."
 },
 {
   "id": 257,
   "type": "CAA",
   "RFC": "RFC 6844",
   "description": "Certification Authority Authorization",
   "function": "DNS Certification Authority Authorization, constraining acceptable CAs for a host/domain"
 },
 {
   "id": 60,
   "type": "CDNSKEY",
   "RFC": "RFC 7344",
   "description": "Child DNSKEY",
   "function": "Child copy of DNSKEY record, for transfer to parent"
 },
 {
   "id": 59,
   "type": "CDS",
   "RFC": "RFC 7344",
   "description": "Child DS",
   "function": "Child copy of DS record, for transfer to parent"
 },
 {
   "id": 37,
   "type": "CERT",
   "RFC": "RFC 4398",
   "description": "Certificate record",
   "function": "Stores PKIX, SPKI, PGP, etc."
 },
 {
   "id": 5,
   "type": "CNAME",
   "RFC": "RFC 1035[1]",
   "description": "Canonical name record",
   "function": "Alias of one name to another: the DNS lookup will continue by retrying the lookup with the new name."
 },
 {
   "id": 49,
   "type": "DHCID",
   "RFC": "RFC 4701",
   "description": "DHCP identifier",
   "function": "Used in conjunction with the FQDN option to DHCP"
 },
 {
   "id": 32769,
   "type": "DLV",
   "RFC": "RFC 4431",
   "description": "DNSSEC Lookaside Validation record",
   "function": "For publishing DNSSEC trust anchors outside of the DNS delegation chain. Uses the same format as the DS record. RFC 5074 describes a way of using these records."
 },
 {
   "id": 39,
   "type": "DNAME",
   "RFC": "RFC 6672",
   "description": "",
   "function": "Alias for a name and all its subnames, unlike CNAME, which is an alias for only the exact name. Like a CNAME record, the DNS lookup will continue by retrying the lookup with the new name."
 },
 {
   "id": 48,
   "type": "DNSKEY",
   "RFC": "RFC 4034",
   "description": "DNS Key record",
   "function": "The key record used in DNSSEC. Uses the same format as the KEY record."
 },
 {
   "id": 43,
   "type": "DS",
   "RFC": "RFC 4034",
   "description": "Delegation signer",
   "function": "The record used to identify the DNSSEC signing key of a delegated zone"
 },
 {
   "id": 55,
   "type": "HIP",
   "RFC": "RFC 8005",
   "description": "Host Identity Protocol",
   "function": "Method of separating the end-point identifier and locator roles of IP addresses."
 },
 {
   "id": 45,
   "type": "IPSECKEY",
   "RFC": "RFC 4025",
   "description": "IPsec Key",
   "function": "Key record that can be used with IPsec"
 },
 {
   "id": 25,
   "type": "KEY",
   "RFC": "RFC 2535[3] and RFC 2930[4]",
   "description": "Key record",
   "function": "Used only for SIG(0) (RFC 2931) and TKEY (RFC 2930).[5] RFC 3445 eliminated their use for application keys and limited their use to DNSSEC.[6] RFC 3755 designates DNSKEY as the replacement within DNSSEC.[7] RFC 4025 designates IPSECKEY as the replacement for use with IPsec.[8]"
 },
 {
   "id": 36,
   "type": "KX",
   "RFC": "RFC 2230",
   "description": "Key Exchanger record",
   "function": "Used with some cryptographic systems (not including DNSSEC) to identify a key management agent for the associated domain-name. Note that this has nothing to do with DNS Security. It is Informational status, rather than being on the IETF standards-track. It has always had limited deployment, but is still in use."
 },
 {
   "id": 29,
   "type": "LOC",
   "RFC": "RFC 1876",
   "description": "Location record",
   "function": "Specifies a geographical location associated with a domain name"
 },
 {
   "id": 15,
   "type": "MX",
   "RFC": "RFC 1035[1] and RFC 7505",
   "description": "Mail exchange record",
   "function": "Maps a domain name to a list of message transfer agents for that domain"
 },
 {
   "id": 35,
   "type": "NAPTR",
   "RFC": "RFC 3403",
   "description": "Naming Authority Pointer",
   "function": "Allows regular-expression-based rewriting of domain names which can then be used as URIs, further domain names to lookups, etc."
 },
 {
   "id": 2,
   "type": "NS",
   "RFC": "RFC 1035[1]",
   "description": "Name server record",
   "function": "Delegates a DNS zone to use the given authoritative name servers"
 },
 {
   "id": 47,
   "type": "NSEC",
   "RFC": "RFC 4034",
   "description": "Next Secure record",
   "function": "Part of DNSSECâused to prove a name does not exist. Uses the same format as the (obsolete) NXT record."
 },
 {
   "id": 50,
   "type": "NSEC3",
   "RFC": "RFC 5155",
   "description": "Next Secure record version 3",
   "function": "An extension to DNSSEC that allows proof of nonexistence for a name without permitting zonewalking"
 },
 {
   "id": 51,
   "type": "NSEC3PARAM",
   "RFC": "RFC 5155",
   "description": "NSEC3 parameters",
   "function": "Parameter record for use with NSEC3"
 },
 {
   "id": 61,
   "type": "OPENPGPKEY",
   "RFC": "RFC 7929",
   "description": "OpenPGP public key record",
   "function": "A DNS-based Authentication of Named Entities (DANE) method for publishing and locating OpenPGP public keys in DNS for a specific email address using an OPENPGPKEY DNS resource record."
 },
 {
   "id": 12,
   "type": "PTR",
   "RFC": "RFC 1035[1]",
   "description": "Pointer record",
   "function": "Pointer to a canonical name. Unlike a CNAME, DNS processing stops and just the name is returned. The most common use is for implementing reverse DNS lookups, but other uses include such things as DNS-SD."
 },
 {
   "id": 46,
   "type": "RRSIG",
   "RFC": "RFC 4034",
   "description": "DNSSEC signature",
   "function": "Signature for a DNSSEC-secured record set. Uses the same format as the SIG record."
 },
 {
   "id": 17,
   "type": "RP",
   "RFC": "RFC 1183",
   "description": "Responsible Person",
   "function": "Information about the responsible person(s) for the domain. Usually an email address with the @ replaced by a ."
 },
 {
   "id": 24,
   "type": "SIG",
   "RFC": "RFC 2535",
   "description": "Signature",
   "function": "Signature record used in SIG(0) (RFC 2931) and TKEY (RFC 2930).[7] RFC 3755 designated RRSIG as the replacement for SIG for use within DNSSEC.[7]"
 },
 {
   "id": 6,
   "type": "SOA",
   "RFC": "RFC 1035[1] and RFC 2308[9]",
   "description": "Start of [a zone of] authority record",
   "function": "Specifies authoritative information about a DNS zone, including the primary name server, the email of the domain administrator, the domain serial number, and several timers relating to refreshing the zone."
 },
 {
   "id": 33,
   "type": "SRV",
   "RFC": "RFC 2782",
   "description": "Service locator",
   "function": "Generalized service location record, used for newer protocols instead of creating protocol-specific records such as MX."
 },
 {
   "id": 44,
   "type": "SSHFP",
   "RFC": "RFC 4255",
   "description": "SSH Public Key Fingerprint",
   "function": "Resource record for publishing SSH public host key fingerprints in the DNS System, in order to aid in verifying the authenticity of the host. RFC 6594 defines ECC SSH keys and SHA-256 hashes. See the IANA SSHFP RR parameters registry for details."
 },
 {
   "id": 32768,
   "type": "TA",
   "RFC": "N/A",
   "description": "DNSSEC Trust Authorities",
   "function": "Part of a deployment proposal for DNSSEC without a signed DNS root. See the IANA database and Weiler Spec for details. Uses the same format as the DS record."
 },
 {
   "id": 249,
   "type": "TKEY",
   "RFC": "RFC 2930",
   "description": "Transaction Key record",
   "function": "A method of providing keying material to be used with TSIG that is encrypted under the public key in an accompanying KEY RR.[10]"
 },
 {
   "id": 52,
   "type": "TLSA",
   "RFC": "RFC 6698",
   "description": "TLSA certificate association",
   "function": "A record for DANE. RFC 6698 defines \"The TLSA DNS resource record is used to associate a TLS server certificate or public key with the domain name where the record is found, thus forming a 'TLSA certificate association'\"."
 },
 {
   "id": 250,
   "type": "TSIG",
   "RFC": "RFC 2845",
   "description": "Transaction Signature",
   "function": "Can be used to authenticate dynamic updates as coming from an approved client, or to authenticate responses as coming from an approved recursive name server[11] similar to DNSSEC."
 },
 {
   "id": 16,
   "type": "TXT",
   "RFC": "RFC 1035[1]",
   "description": "Text record",
   "function": "Originally for arbitrary human-readable text in a DNS record. Since the early 1990s, however, this record more often carries machine-readable data, such as specified by RFC 1464, opportunistic encryption, Sender Policy Framework, DKIM, DMARC, DNS-SD, etc."
 },
 {
   "id": 256,
   "type": "URI",
   "RFC": "RFC 7553",
   "description": "Uniform Resource Identifier",
   "function": "Can be used for publishing mappings from hostnames to URIs."
 },
 {
   "id": 255,
   "type": "*",
   "RFC": "RFC 1035[1]",
   "description": "All cached records",
   "function": "Returns all records of all types known to the name server. If the name server does not have any information on the name, the request will be forwarded on. The records returned may not be complete. For example, if there is both an A and an MX for a name, but the name server has only the A record cached, only the A record will be returned. Sometimes referred to as \"ANY\", for example in Windows nslookup and Wireshark."
 },
 {
   "id": 252,
   "type": "AXFR",
   "RFC": "RFC 1035[1]",
   "description": "Authoritative Zone Transfer",
   "function": "Transfer entire zone file from the master name server to secondary name servers."
 },
 {
   "id": 251,
   "type": "IXFR",
   "RFC": "RFC 1996",
   "description": "Incremental Zone Transfer",
   "function": "Requests a zone transfer of the given zone but only differences from a previous serial number. This request may be ignored and a full (AXFR) sent in response if the authoritative server is unable to fulfill the request due to configuration or lack of required deltas."
 },
 {
   "id": 41,
   "type": "OPT",
   "RFC": "RFC 6891",
   "description": "Option",
   "function": "This is a \"pseudo DNS record type\" needed to support EDNS"
 },
];
