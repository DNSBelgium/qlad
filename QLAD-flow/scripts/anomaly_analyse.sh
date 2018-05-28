#!/bin/sh

# example of usage:
#./analyse.sh replies "/data/dnscap/andraste/andraste.ns.nic.cz.20120401.*" > anom_andraste_20120401.txt

REPLY=replies
QUERY=queries
WHOLE=whole

WINDOW=600
INTERVAL=600
AGGREG=8
GAMMAPAR="both"
THRESH=1.2
HASHCNT=25
SKETCHCNT=32

if [ "x$1" = "x${REPLY}" ]; then
	POLICY="dstIP"
	ADDITIONAL="-r"
	COMMAND="mergecap $2 -w - | ./dnsanalyzer -w ${WINDOW} -i ${INTERVAL} -a ${AGGREG} -p ${GAMMAPAR} -t ${THRESH} -P ${POLICY} -c ${HASHCNT} -s ${SKETCHCNT} ${ADDITIONAL}"
	echo "#${COMMAND}"
	sh -c "${COMMAND}"
	echo ok
else if [ "x$1" = "x${QUERY}" ]; then
	POLICY="srcIP"
	ADDITIONAL="-q"
	COMMAND="mergecap $2 -w - | ./dnsanalyzer -w ${WINDOW} -i ${INTERVAL} -a ${AGGREG} -p ${GAMMAPAR} -t ${THRESH} -P ${POLICY} -c ${HASHCNT} -s ${SKETCHCNT} ${ADDITIONAL}"
	echo "#${COMMAND}"
	sh -c "${COMMAND}"
else if [ "x$1" = "x${WHOLE}" ]; then
	POLICY="srcIP"
	COMMAND="mergecap $2 -w - | ./dnsanalyzer -w ${WINDOW} -i ${INTERVAL} -a ${AGGREG} -p ${GAMMAPAR} -t ${THRESH} -P ${POLICY} -c ${HASHCNT} -s ${SKETCHCNT}"
	echo "#${COMMAND}"
	sh -c "${COMMAND}"
else
	echo "Usage: $0 ${REPLY}|${QUERY}|${WHOLE} \"pcap_file_wildcard\""
fi
fi
fi
