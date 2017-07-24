"use strict";
var bunyanUdp   = require('@astronomer/bunyan-udp');
var Logger      = require('bunyan');
var _           = require('lodash');

const C={
  logstash: {
    host:"192.168.99.100",
    port: 5959
  },
  service : {
    name: "test"
  }
}


const udpStream = bunyanUdp.createStream({
  host: C.logstash.host,
  port: C.logstash.port
})

const bunyan = new Logger({
  name: C.service.name,
  streams: [
    {
      type: "stream",
      level: "debug",
      stream: udpStream
    },
    {
      level: 'debug',
      stream: process.stdout
    }
  ],
})
bunyan.level("debug")

const extendObjectWithRequestId = (...args) => {
  const requestId = "abcd-1234-wsxc-rfvb"

  if (args[0] && requestId) {
    if (_.isObject(args[0])) {
      args[0]['requestId'] = requestId

      return args

    } else {
      const logObject = { requestId: requestId }

      return _.concat([logObject], args)

    }
  }

  return args
}

const log = {}

log.trace = (...args) => bunyan.trace(...extendObjectWithRequestId(...args))

log.debug = (...args) => bunyan.debug(...extendObjectWithRequestId(...args))

log.info = (...args) => bunyan.info(...extendObjectWithRequestId(...args))

log.warn = (...args) => bunyan.warn(...extendObjectWithRequestId(...args))

log.error = (...args) => bunyan.error(...extendObjectWithRequestId(...args))

log.fatal = (...args) => bunyan.fatal(...extendObjectWithRequestId(...args))

global.log = log

const obj = { time: new Date(), msg: 'Test1', testField: 1 }

//log.info({abcd:"efgh1"},JSON.stringify(obj));
require('./unhandledProcessErrors')
//log.debug({abcd:"efgh2"},JSON.stringify(obj));


setTimeout(() => {console.log('exiting')}, 5000);
