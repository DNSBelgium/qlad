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
# Fetch new data with impala and identify anomalies
# 
############################################################


NAMESERVER=$1
HISTORY_FILE="$TMP_DIR/$NAMESERVER-QLAD-global.hist"
PID=$TMP_DIR/run_qlad_global_analyse_$NAMESERVER

#----- functions ---------------

cleanup(){
  #remove pid file
  if [ -f $PID ];
  then
     rm $PID
  fi 
}

# ------- main program -----------

echo "[$(date)] : start QLAD-global for $NAMESERVER"

if [ -f $PID ];
then
   echo "[$(date)] : $PID  : Process is already running, do not start new process."
   exit 1
fi

#create pid file
echo 1 > $PID

#Make sure cleanup() is called when script is done processing or crashed.
trap cleanup EXIT

#check if hist file exists, if not create it
if ! [ -f "$HISTORY_FILE" ]
then
  touch $HISTORY_FILE
  date +%s > $HISTORY_FILE
fi

#start analyse
BEGIN=$(tail -n1 $HISTORY_FILE)
python $QLADGLOBAL_HOME/main.py -s $NAMESERVER -b $BEGIN -t $THRESHOLD | tee  >(awk '/--begin /{print $NF}' > $HISTORY_FILE)


echo "[$(date)] : done for $NAMESERVER."
