#!/usr/bin/python

# NOTICE: this is a modified version of the original version from git://git.nic.cz/dns-anomaly/
# modified 2017-07-27 by Pieter Robberechts in context of implementing QLAD system at DNS Belgium
# to add ASN to each detected anomaly and group anomalies by ASN

import sys
import json
from optparse import OptionParser
from pymongo import MongoClient
import pygeoip
from tld import get_tld
from anomaly_parser import AnomalyParser, ParserError

def main():
    # Parse CLI options
    parser = OptionParser(usage="usage: %prog [options] anomalies",
                          version="%prog 1.0")
    parser.add_option("-f", "--file",
                      dest="anomalies_file",
                      action="store",
                      type="string",
                      help="Read detected anomalies from file. Omit to use stdIn.",
                      metavar="FILE")
    parser.add_option("-t", "--type",
                      dest="anomalies_type",
                      action="store",
                      type="string",
                      help="The type of these anomalies (Domain, Resolver or Global)",
                      metavar="STRING")
    parser.add_option("-s", "--server",
                      dest="server",
                      action="store",
                      type="string",
                      help="The server which generated the traffic.",
                      metavar="STRING")
    parser.add_option("-m", "--maxmind",
                      dest="maxmind",
                      action="store",
                      type="string",
                      help="Path to maxmind database files.",
                      metavar="STRING")
    (options, args) = parser.parse_args()

    # Verify CLI options
    if not options.anomalies_file:
        options.anomalies_file = sys.stdin
    if not options.anomalies_type:
        sys.stderr.write("No type given for these anomalies.\n")
        sys.exit(-1)
    if not options.anomalies_type in ["Domain", "Resolver", "ASN"]:
        sys.stderr.write("%s is not a valid type.\n" % options.anomalies_type)
        sys.exit(-1)
    if not options.server:
        sys.stderr.write("Provide a server name.")
        sys.exit(-1)
    if not options.maxmind:
        sys.stderr.write("Provide the path to the maxmind database.")
        sys.exit(-1)

    result = parse_anomalies(options.anomalies_file, options.anomalies_type, options.server, options.maxmind)
    store_in_mongoDB(result)


def parse_anomalies(anomalies_file, anomalies_type, server, maxmind):
    # Initialize the anomaly parser
    ap = AnomalyParser()
    try :
        ap.open_file(anomalies_file)
    except:
        sys.stderr.write("Cannot open file %s\n" % anomalies_file)
        sys.exit(-1)

    # Parse the anomalies
    formatted_anomalies = []
    while True:
        try:
            parsed_anomalies = ap.get_next_anomalies()
        except ParserError as e:
            sys.stderr.write("Error while parsing file %s: %s\n" % (e.value))
            sys.exit(-1)
        if not parsed_anomalies:
            break
        for ip in parsed_anomalies.anomalies:
            formatted_anomalies.append({
                'start': parsed_anomalies.from_time,
                'end': parsed_anomalies.to_time,
                'subject': ip,
                'type': anomalies_type,
                'asn': ASN_lookup(ip, anomalies_type, maxmind),
                'server': server
            })

    if anomalies_file is not sys.stdin:
        ap.close_file()

    return formatted_anomalies

def ASN_lookup(id, anomaly_type, maxmind):
    gi = pygeoip.GeoIP(maxmind+'/GeoIPASNum.dat')
    try:
        if anomaly_type == "Resolver":
            return gi.asn_by_addr(id)
        elif anomaly_type == "Domain":
            return gi.asn_by_name(get_tld("http://"+id[:-1]))
        elif anomaly_type == "ASN":
            return id
    except:
        return "Unknown"

def store_in_mongoDB(anomalies):
    if len(anomalies):
        client = MongoClient()
        db = client['QLAD']
        result = db.anomalies.insert_many(anomalies)
        if result:
            print ("Successfull saved {} anomalies.".format(len(anomalies)))
    else:
        print ("No anomalies found.")

if __name__ == "__main__":
    main()
