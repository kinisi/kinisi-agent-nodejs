#!/bin/bash
LOGDIR=~/.kinisiagent/logs
SCRIPTDIR=$(dirname "$0")

pushd $SCRIPTDIR/..
  (nohup node kinisi-agent.js > $LOGDIR/kinisi.log 2>&1 )&
popd
