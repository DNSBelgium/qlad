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

from __future__ import division
from impala.dbapi import connect
from math import log10
from optparse import OptionParser
from pymongo import MongoClient
from datetime import datetime
import json
import logging
import sys
import ema_filter

# Databases
IMPALA_HOST='impalahost'
IMPALA_PORT=21050
MONGO_HOST='localhost:27017'
MONGO_DB='QLAD'

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s: %(message)s', datefmt='%d-%m-%Y %H:%M')
ch.setFormatter(formatter)
logger.addHandler(ch)


def main():
    # Parse CLI options
    parser = OptionParser(usage="usage: %prog [options]",
                          version="%prog 1.0")
    parser.add_option("-s", "--server",
                      dest="server",
                      action="store",
                      type="string",
                      help="The server for which stats should be retrieved.",
                      metavar="STRING")
    parser.add_option("-b", "--begin",
                      dest="begin",
                      action="store",
                      type="int",
                      help="Unix timestamp defining the start of the first window.",
                      metavar="STRING")
    parser.add_option("-w", "--window",
                      dest="window",
                      action="store",
                      type="int",
                      help="Size of a window (in seconds).",
                      metavar="INT")
    parser.add_option("-t", "--threshold",
                      dest="threshold",
                      action="store",
                      type="float",
                      help="The detection threshold",
                      metavar="FLOAT")
    (options, args) = parser.parse_args()

    # Verify CLI options
    if not options.server:
        sys.stderr.write("Provide a server name.\n")
        sys.exit(-1)
    if not options.begin:
        sys.stderr.write("Provide a timestamp for the start of the first window.\n")
        sys.exit(-1)
    if not options.window:
        options.window = 60*5;
        sys.stderr.write("Using the default window of 5m.\n")
    if not options.threshold:
        options.threshold = 3.0;
        sys.stderr.write("Using the default threshold of 3.\n")


    features = ['domainname', 'qtype', 'src', 'rcode', 'asn', 'country', 'res_len']
    #features = ['rcode']
    documents = []

    last_ts = get_last_ts(options.server)
    begin = options.begin
    end = begin + options.window
    while end < last_ts:
        # Fetch data from impala
        logger.info("Fetching data for {} between {} and {}. Last TS in impala is {}"
                     .format(options.server, datetime.fromtimestamp(begin), datetime.fromtimestamp(end), datetime.fromtimestamp(last_ts)))
        histograms = fetch_data(features, begin, end, options.server)
        entropies = [entropy(histogram) for histogram in histograms]
        # Detect anomalies in fetched data
        logger.info("Detecting anomalies for {} between {} and {}."
                     .format(options.server, datetime.fromtimestamp(begin), datetime.fromtimestamp(end)))
        anomalies = []
        for feature, ent in zip(features, entropies):
            anomaly = detect_anomaly(feature, ent, options.server, options.threshold)
            if anomaly is not None:
                anomalies.append({ 'feature': feature, 'score': anomaly })
        # Create a mongoDB document for the data and anomalies
        documents.append(to_document(begin, end, options.server, features, histograms, anomalies))
        # Go to the next window
        begin = end
        end = begin + options.window
    # Store everything in the mongoDB database
    store_in_mongoDB(documents)
    # print(json.dumps(documents))
    print("Start next execution with --begin {}".format(begin))


def get_last_ts(server):
    conn = connect(host=IMPALA_HOST, port=IMPALA_PORT)
    cur = conn.cursor()
    cur.execute("SELECT MAX(unixtime) "
                "FROM dns.staging "
                "WHERE server = '{0}'".format(server))
    logger.debug("Get last ts from impala with" + str(cur.description))
    return cur.fetchall()[0][0]


def fetch_data(features, begin, end, server):
    conn = connect(host=IMPALA_HOST, port=IMPALA_PORT)
    cur = conn.cursor()
    histograms = []
    for feature in features:
        sql="SELECT {0}, count({0}) AS cnt FROM dns.staging WHERE unixtime >= {1} AND unixtime < {2} AND server = '{3}' GROUP BY {0}".format(feature, begin, end, server)
        logger.debug("Executing sql: " + sql )
        cur.execute(sql)
        logger.debug("Get description of results returned by impala query for feature:" + str(feature) + str(cur.description))
        output=cur.fetchall()
        logger.debug("length of output of impala query for " + feature + ":" + str(len(output)))
        histograms.append(output)
    conn.close()
    return histograms


def entropy(histogram):
    """ Computes the normalized entropy of a histogram. """
    total = sum([bin[1] for bin in histogram])
    if total == 0:
        return 0.0

    entropy = 0.0
    for bin in histogram:
        if bin[1] > 0:
            entropy -= (bin[1]/total)*log10(bin[1]/total)

    # clip small negative values
    if entropy < 0:
        return 0.0
    return entropy / log10(len(histogram))


def detect_anomaly(feature, entropy, server, threshold=3):
    filter_id =  "%s_%s" % (server, feature)
    filt = ema_filter.load(filter_id)
    newEMA, newEMS = filt.update(entropy)
    filt = ema_filter.EMA(0.99, newEMA, newEMS)
    ema_filter.save(filt, filter_id)
    if filt.is_anomaly(entropy, threshold):
        return newEMS
    else:
        return None

def histogram_to_document(histogram, nb_keep=20):
    sorted_histogram = sorted(histogram, key=lambda bin: bin[1], reverse=True)
    return [{'key': bin[0], 'value': bin[1]} for bin in sorted_histogram[:nb_keep]]


def to_document(start, end, server, features, histograms, anomalies):
    document = {}
    document['start'] = start
    document['end'] = end
    document['server'] = server
    #logger.debug("To document for  features:" + str(features) + " histograms:" + str(histograms) )
    #logger.debug("ZIP" + str(zip(features, histograms)) )
    #CONTENT OF features en histograms
    #Histogram is list of histograms. histogram[0] is histogram for first feature in list "features", histogram[1} is histogram for second feature in list "features" and so on
    #(zip(features, histograms))
    #RESULT FROM ZIP  ZIP[('rcode', [(3, 26204), (5, 19), (4, 2), (9, 1), (-1, 26), (0, 50514), (1, 1)]),(qtype,[('......]
    logger.debug("Length of array of array of histograms is " +  str(len(histograms)))
    for feature, histogram in zip(features, histograms):
    #logger.debug("To document for  feature:" + str(feature) + " histogram:" + str(histogram) )
    logger.debug("histogram of feature " +  str(feature) + " contains " + str(len(histogram))  + " (value of " + str(feature) + ":count of " + str(feature) + ") tuple pairs")
    #Quick & dirty workaround for now, sometimes we get an empty histogram probably due to timestamp where we want to query is in the future sometimes?
    #This is crashing this script so prevent crashing
    if str(len(histogram)) == "0":
      logger.debug("Length of histogram is 0, activating quick workaround of setting max min and avg to 0 for this window")
      document[feature] = {
        'histogram': histogram_to_document(histogram),
        'entropy': entropy(histogram),
        'max': 0,
        'min': 0,
        'avg': 0
      }
  else:
      document[feature] = {
        'histogram': histogram_to_document(histogram),
        'entropy': entropy(histogram),
        'max': max([bin[1] for bin in histogram]),
        'min': min([bin[1] for bin in histogram]),
        'avg': sum([bin[1] for bin in histogram])/len(histogram)
      }
    document['nb_queries'] = sum([bin[1] for bin in histograms[0]])
    document['anomalies'] = anomalies
    return document


def store_in_mongoDB(documents):
    if len(documents):
        client = MongoClient(host=[MONGO_HOST])
        db = client[MONGO_DB]
        result = db.dnsstats.insert_many(documents)
        if result:
            logger.info("Successfully saved {} windows.".format(len(documents)))
    else:
        logger.info("No new windows found.")


if __name__ == "__main__":
    main()