kinisi-agent-nodejs
===================

Kinisi Agent written in NodeJS


### Getting Started

For full step-by-step instructions on provisioning a new Kinisi device from scratch using this code and scripts contained in this repository, see the [New Image Provisioning Steps Guide](https://github.com/kinisi/kinisi-agent-nodejs/wiki/New-Image-Provisioning-Steps-v1.0). 

### Additional legacy information from initial commit and updates during 2014 contained below

Start on local mocks (without a GPS device or remote kinisi server):

```sh
$ npm install
$ export NODE_ENV=mock
$ node kinisi-agent.js
```


### Raspberry Pi:

[Proof-of-Concept (POC) Setup](https://github.com/kinisi/kinisi-agent-nodejs/wiki/POC-Setup): a full POC deployment procedure.

[Upgrade procedures](https://github.com/kinisi/kinisi-agent-nodejs/wiki/POC-Upgrade): for moving from one POC version to another.

### Quick Tips on Usage:

LED Indicators: 

GPS Data Indicators - On the GPS dongle/unit, a blinking red LED indicates a signal lock with one or more satellites, while a solid red indicates there is no lock. Note that a satellite lock by the GPS unit does not necessarily indicate that the Kinisi device/app is properly retrieving the GPS data from the dongle. The blinking red LED, which is built-in near the Micro USB power input, indicates that the device/app is retrieving the GPS data from the dongle and caching it on the device. 

Cloud Syncing Indicator - On a Raspberry Pi models B, B+ and B+ version 2, a blinking green (built-in) LED near the Micro USB power input indicates that the device is syncing data with the cloud properly. 
