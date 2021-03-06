#!/bin/bash
# This is a helper script to install Nodejs
# In the installation order, this script comes after the Pi has been setup and GPSD installed
cd /usr/local
wget http://nodejs.org/dist/v0.10.24/node-v0.10.24-linux-arm-pi.tar.gz
tar xzf node-v0.10.24-linux-arm-pi.tar.gz
ln -s node-v0.10.24-linux-arm-pi nodejs
ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm
npm install -g forever
echo Done with Nodejs Installation Script
