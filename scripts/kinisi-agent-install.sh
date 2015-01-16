#!/bin/bash
# This is a helper script for installing the Kinisi agent
# This script assumes that the agent is untarred already at /usr/local/ and nodejs-install.sh was run. 
# tar xzf master.tar.gz
mv kinisi-agent-nodejs-master kinisi-agent-nodejs
cd kinisi-agent-nodejs
# Install NPM dependencies
npm install
# Setup some directories
chmod -R 777 config
mkdir -p /var/log/kinisiagent/archive
mkdir -p /usr/local/kinisi-agent/nodejs/run/commit
# Install Service
cp /usr/local/kinisi-agent-nodejs/scripts/kinisiagent /etc/init.d/kinisiagent
chmod 755 /etc/init.d/kinisiagent
update-rd.d kinisiagent defaults
echo Done with Kinisi Agent Install Script
