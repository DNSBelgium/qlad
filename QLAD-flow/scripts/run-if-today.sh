#!/usr/bin/env bash

#see: https://github.com/xr09/cron-last-sunday

# Examples:
# 1st Monday	--> run-if-today 1 "Mon"
# 2nd Friday	--> run-if-today 2 "Fri"
# last Sunday	--> run-if-today [l|L] "Sun"


# date ranges
#	week	dates
#	1	1-7
#	2	8-14
#	3	15-21
#	4	22-28
#	5	29-lastday	(you probably need [L]ast week instead)
#	L	(lastday-6)-lastday


# If is not that day of the week 
# not even bother running all the cool checks
if [ $(date "+%a")  != $2 ] 
then
  exit 1
fi

# Ok, it's that day, let's run some fancy code

# you'll need this, that's for sure
today=$(date "+%d")


# First of all: Is it one of those "last friday" tasks?
case "$1" in 

"l" | "L" )
  month=$(date "+%m")
  # April, June, September and November have 30 days
  # all oters have 31 except February, careful with that one..
  case $month in
    "04" | "06" | "09" | "11")
	lastday=30
     ;;
     
     "02" )
	year=$(date "+%Y")
	# ah evil february we meet again, is this a leap year?
	if [ $(date -d "$year-02-29" > /dev/null 2>&1) ]
	then
	  # it's a leap year, we almost  fall for that one
	  lastday=29
	else
	  # it's a regular february
	  lastday=28
	fi
     ;;
     
     * )
	lastday=31
     ;;
  esac
  
  startlastweek=$[ $lastday - 6 ]
  if [ $today -ge $startlastweek ] && [ $today -le $lastday ]
  then
    # this is last week of the month
    exit 0
    
    # and that's how you get the last week date range junior!
    # 	hmm, but dad we now use python... is pretty simple..
    # shush, now I'll teach you to make a c compiler with some string and a toothbrush
    # 	here we go again.. :/
  fi  
;;
esac

# plain old nth day code
minday=$[ 1 + $[ 7 * $[$1-1] ] ]
maxday=$[ $minday + 7 ]
if [ $today -ge $minday  ] && [  $today -lt $maxday ]
then
  # green light, fire at will
  exit 0
fi

# not the right day, maybe next time
exit 1
