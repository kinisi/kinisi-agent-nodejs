kinisi-agent-nodejs
===================

Kinisi Agent written in NodeJS


### Getting Started

Start on local mocks (without a GPS device or remote kinisi server):

```sh
$ npm install
$ export NODE_ENV=mock
$ node kinisi-agent.js
```


Deployed on a Raspberry Pi:
```sh
# If you didn't tarball/scp the entire directory, first run the install:
# npm install
$ export NODE_ENV=production
$ node kinisi-agent.js
```
