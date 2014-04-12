#!/bin/bash

dev=/dev/gsmmodem

# From http://en.wikibooks.org/wiki/Serial_Programming/Serial_Linux

if tty -s < "$dev"; then
  true #echo "$dev is indeed a serial device."
else
  echo "$dev is not a serial device."
  exit 1
fi

trap timeout 14
timeout() {
   echo "timeout occurred"
   exit 1
}
pid=$$
#( sleep 60 ; kill -14 $pid; )& # send alarm signal after 60 sec.
# normal script contents goes here

# Set up device and read from it.
# Capture PID of background process so it is possible
# to terminate background process once writing is done
# TODO: Also set up a trap in case script is killed
#       or crashes.
##( stty ispeed 460800 ospeed 460800; cat; )& < $dev
#( cat $dev; )& #< $dev
(while read line ; do if [[ $line != OK* ]] ; then if [[ $line == ^ICCID* ]] ; then echo $line | grep ICCID: | cut -d: -f2 | tr -d ' ' | tr -d '\n' | tr -d '\r' ; fi ; else true ; break ; fi ; done < /dev/gsmmodem) &
bgPid=$?
#cho $bgPid
# Read commands from user, send them to device
#while read cmd; do
#   echo "$cmd" 
#done >$dev
echo -e "AT^ICCID?\r" > $dev
# Terminate background read process
#kill $bgPid

wait
