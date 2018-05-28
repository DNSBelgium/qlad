#!/usr/bin/python

# QLAD - An anomaly detection system for DNS traffic
# Copyright (C) 2017 DNS Belgium
#
# This file is part of QLAD.
#
# QLAD is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# QLAD is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with QLAD.  If not, see <http://www.gnu.org/licenses/>.

import sys
import anomaly_parser
import json
from optparse import OptionParser

parser = OptionParser()
parser.add_option("-a", "--anomalies", dest="anomalies_files",
    action="append", type="string",
    help="Read file containing detected anomalies.",
    metavar="FILE")
parser.add_option("-t", "--type", dest="anomalies_type",
    action="store", type="string",
    help="The type of these anomalies (Domain, Resolver or Global)",
    metavar="STRING")


(options, args) = parser.parse_args()

ap = anomaly_parser.anomaly_parser()


if not options.anomalies_files:
    sys.stderr.write("No file containing detected anomalies given.\n")
    sys.exit(-1)
if not options.anomalies_type:
    sys.stderr.write("No type given for these anomalies.\n")
    sys.exit(-1)
if not options.anomalies_type in ["Domain", "Resolver", "Global"]:
    sys.stderr.write("%s is not a valid type.\n" % options.anomalies_type)
    sys.exit(-1)

anomaly_list = []
for anomf in options.anomalies_files:
    try :
        ap.open_file(anomf)
    except:
        sys.stderr.write("Cannot open file %s\n" % anomf)
        continue

    # read through the anomalies
    anomalies = None
    try:
        anomalies = ap.get_next_anomalies()
    except parser_error as e:
        sys.stderr.write("Error while parsing file %s: %s\n" % (anomf, e.value))
        sys.exit(-1)
    while anomalies:
        for ip in anomalies.anomalies:
            anomaly = {
                'start': anomalies.from_time, 
                'end': anomalies.to_time, 
                'subject': ip, 
                'type': options.anomalies_type
            }
            anomaly_list.append(anomaly)


        try:
            anomalies = ap.get_next_anomalies()
        except parser_error as e:
            sys.stderr.write("Error while parsing file %s: "\
                "%s\n" % (anomf, e.value))
            sys.exit(-1)

    ap.close_file()

with open('anomalies.json', 'w') as outfile:
    json.dump(anomaly_list, outfile)
