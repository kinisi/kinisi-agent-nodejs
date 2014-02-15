#!/bin/bash
LOGDIR=~/.kinisiagent/logs
SCRIPTDIR=$(dirname "$0")

# Ensure log directory
if [ ! -d $LOGDIR ]; then 
    mkdir -p $LOGDIR
fi

# Change to app directory first (for Node.JS, relative paths are important)
pushd $SCRIPTDIR/..
  (nohup node kinisi-agent.js > $LOGDIR/kinisi.log 2>&1 )&
popd
