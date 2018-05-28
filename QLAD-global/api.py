
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

from pymongo import MongoClient

class API(object):
    _db_connection = None
    _db_cur = None

    def __init__(self, host='localhost', port=27017):
        self._db_connection = MongoClient(host, port)
        self._db_cur = self._db_connection['dnsdashboard-api']

    def get_entropy(self, stat_name, dimension_name, last_time=0):
        data = self._db_cur.dnsstats.find({'name': stat_name, 'start_time': {'$gt': last_time}}, ["start_time", "aggregations"])
        result = []
        for d in data:
            result.append(tuple([d["start_time"], d["aggregations"][0][dimension_name]["entropy"]]))
        return result

    def get_pkts_captured(self, last_time=0):
        data = self._db_cur.dnsstats.find({'name': 'pcap_stats', 'start_time': {'$gt': last_time}}, ["start_time", "data"])
        result = []
        for d in data:
            result.append(tuple([d["start_time"], d["data"][0]["pcap_stat"][0]["count"]]))
        return result

    def __del__(self):
        self._db_connection.close()
