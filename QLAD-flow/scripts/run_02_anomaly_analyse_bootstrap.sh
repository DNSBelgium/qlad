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

############################################################
#
# Boostrap an anomaly detection process for each name server
# 
############################################################

#Start an anomaly detection process for every name server

echo "[$(date)] :Start parallel anomaly detection"

#parallel will start process for each name server with the same config file
#replace colon with whitespace so it will work with gnu parallel
nslist=$(echo $NAMESERVERS | tr ';' ' ')

parallel run_02_anomaly_analyse.sh ::: $nslist



