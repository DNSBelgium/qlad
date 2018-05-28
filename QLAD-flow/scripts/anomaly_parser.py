#!/usr/bin/python

# NOTICE: this is a modified version of the original version from git://git.nic.cz/dns-anomaly/
# modified 2017-07-27 by Pieter Robberechts in context of implementing QLAD system at DNS Belgium
# to add ASN to each detected anomaly and group anomalies by ASN

import glob
import re
import sys
import time

class ParserError(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)


class StructAnomalies:
    from_time = None
    to_time = None
    cnt_found = None
    cnt_all = None
    anomalies = None
    def __init__(self, from_time=None, to_time=None, cnt_found=None,
                 cnt_all=None, anomalies=None):
        self.from_time = from_time
        self.to_time = to_time
        self.cnt_found = cnt_found
        self.cnt_all = cnt_all
        self.anomalies = anomalies
    def __str__(self):
        return "%s(from_time=%r, to_time=%r, cnt_found=%r, cnt_all=%r, "\
            "anomalies=%r)" % (
            self.__class__.__name__,
            self.from_time, self.to_time, self.cnt_found, self.cnt_all,
            self.anomalies)


class AnomalyParser:
    def __init__(self):
        self.from_re = re.compile("From: ")
        self.to_re = re.compile("To: ")
        self.found_re = re.compile("found anomalies ")
        self.ok_re = re.compile("ok")

        self.st_expect_from_or_ok = 0
        self.st_expect_to = 1
        self.st_expect_found = 2

        self.af = None
        self.state = self.st_expect_from_or_ok

        self.cntr_line = 0

    def open_file(self, filename):
        if filename is not sys.stdin:
            self.af = open(filename, "r")
        else:
            self.af = sys.stdin
        self.state = self.st_expect_from_or_ok
        self.cntr_line = 0

    def close_file(self):
        self.af.close()

    @staticmethod
    def since_epoch_from_file_format(string_time):
        return time.mktime(time.strptime(string_time, "%a %b %d %H:%M:%S %Y"))

    @staticmethod
    def file_format_from_since_epoch(since_epoch):
        return time.strftime("%a %b %d %H:%M:%S %Y",
                             time.localtime(since_epoch))

    def _parse_from_line(self, line):
        if not self.from_re.search(line):
            return None
        return self.since_epoch_from_file_format(
            self.from_re.sub("", line.strip()))

    def _parse_to_line(self, line):
        if not self.to_re.search(line):
            return None
        return self.since_epoch_from_file_format(
            self.to_re.sub("", line.strip()))

    def _parse_found_line(self, line):
        if not self.found_re.search(line):
            return None
        data = re.split(" : ", self.found_re.sub("", line.strip()))
        num = re.findall("[0-9]+", data[0])
        num_found = int(num[0])
        num_all = int(num[1])
        data = re.split(", ", data[1].strip())
        return (num_found, num_all, data)

    def get_next_anomalies(self):
        """
        Returns structure containing, start time, stop time and 
        detected anomalies.
        """

        from_time = None
        to_time = None
        found_anomalies = None

        for line in self.af:
            self.cntr_line = self.cntr_line + 1
            if self.state == self.st_expect_from_or_ok:
                from_time = self._parse_from_line(line)
                if from_time:
                    self.state = self.st_expect_to
                elif self.ok_re.search(line):
                    return None
                else:
                    raise ParserError("Error parsing \"From\" value "\
                        "at line %d" % self.cntr_line)

            elif self.state == self.st_expect_to:
                to_time = self._parse_to_line(line)
                if to_time:
                    self.state = self.st_expect_found
                else:
                    raise ParserError("Error parsing \"To\" value "\
                        "at line %d" % self.cntr_line)

            elif self.state == self.st_expect_found:
                found_anomalies = self._parse_found_line(line)
                if found_anomalies:
                    self.state = self.st_expect_from_or_ok
                    return StructAnomalies(from_time, to_time,
                        found_anomalies[0], found_anomalies[1],
                        found_anomalies[2])
                else:
                    raise ParserError("Error parsing \"found anomalies\" "\
                        "at line %d" % self.cntr_line)

        return None
