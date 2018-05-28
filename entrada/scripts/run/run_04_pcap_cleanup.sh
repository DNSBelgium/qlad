#!/usr/bin/env bash

# ENTRADA, a big data platform for network data analytics
# 
# Copyright (C) 2016 SIDN [https://www.sidn.nl]
#  
# This file is part of ENTRADA.
# 
# ENTRADA is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# ENTRADA is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#  
# You should have received a copy of the GNU General Public License
# along with ENTRADA.  If not, see [<http://www.gnu.org/licenses/].

# NOTICE: this is a modified version of https://github.com/SIDN/entrada
# modified 2017-08-01 by Pieter Robberechts in context of implementing QLAD system at DNS Belgium
# to support continuous anomaly detection from S3 bucket

############################################################
#
# delete old pcap files
# 
############################################################

find $DATA_DIR/processed/archive/**/*.pcap*.gz -mmin +$PCAP_MINS_TO_KEEP -exec rm {} \;
