#!/usr/bin/env bash
#
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
#

############################################################
#
# Detect anomalies in received PCAP files.
# 
############################################################


NAMESERVER=$1


PID=$TMP_DIR/run_02_anomaly_analyse_$NAMESERVER

#-------------------------------
# Helper functions
#------------------------------

cleanup(){
  #remove pid file
  if [ -f $PID ];
  then
     rm $PID
  fi  
}


#-----------------------------
# Main script
#-----------------------------

if [ -f $PID ];
then
   echo "[$(date)] : $PID  : Process is already running, do not start new process."
   exit 0
fi

#create pid file
echo 1 > $PID

#Make sure cleanup() is called when script is done processing or crashed.
trap cleanup EXIT

#check if there are pcap files available
if [ ! "$(ls -A $DATA_DIR/processing/$NAMESERVER/*.pcap.gz)" ];
then
    echo "[$(date)] :No pcap files available, quit script"
    exit 0
fi

cd $DATA_DIR/processing/$NAMESERVER
#loop through all *.pcap files
#Skip opened files
files=($(ls *.pcap.gz | while read filename ; do lsof +D $DATA_DIR/processing/$NAMESERVER | grep $filename || echo $filename ; done))
fcount=${#files[@]}
echo "[$(date)] : found $fcount files to check"

echo "[$(date)] :Start anomaly detection for $NAMESERVER with srcIP policy"
COMMAND="dnsanalyzer -w ${WINDOW} -i ${INTERVAL} -a ${AGGREG} -p ${GAMMAPAR} -t ${THRESH} -P srcIP -c ${HASHCNT} -s ${SKETCHCNT} -q"
pcapmerge - "${files[@]}" 2> /dev/null | $COMMAND | python $QLADFLOW_HOME/scripts/send_anomalies.py -t "Resolver" -s $NAMESERVER -m $TMP_DIR/maxmind


echo "[$(date)] :Start anomaly detection for $NAMESERVER with qname policy"
COMMAND="dnsanalyzer -w ${WINDOW} -i ${INTERVAL} -a ${AGGREG} -p ${GAMMAPAR} -t ${THRESH} -P qname -c ${HASHCNT} -s ${SKETCHCNT} -q"
pcapmerge - "${files[@]}" 2> /dev/null | $COMMAND | python $QLADFLOW_HOME/scripts/send_anomalies.py -t "Domain" -s $NAMESERVER -m $TMP_DIR/maxmind


#delete processed files
rm "${files[@]}"
