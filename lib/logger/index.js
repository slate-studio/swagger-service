'use strict'

global.Promise = require('bluebird')
global._       = require('lodash')

const cls       = require('continuation-local-storage')
const namespace = cls.createNamespace('loggerNamespace')
require('cls-bluebird')(namespace)

const Logger             = require('bunyan')
const bunyanUdp          = require('@astronomer/bunyan-udp')
const logUnhandledErrors = require('./logUnhandledErrors')

const udpStream = bunyanUdp.createStream({
  host: C.logstash.host,
  port: C.logstash.port || 5959
})

const errSerializer = (err) =>{
  const logObj = Logger.stdSerializers.err(err)
  if (err && err.requestId){
    logObj.requestId = err.requestId
  }
  return logObj
}

const bunyan = new Logger({
  name: C.service.name,
  serializers: {err: errSerializer},
  streams: [
    {
      type: 'stream',
      level: 'debug',
      stream: udpStream
    },
    {
      level: 'debug',
      stream: process.stdout
    }
  ],
})

bunyan.level('debug')

const extendObjectWithRequestId = (...args) => {
  const requestId = namespace.get('requestId')

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

logUnhandledErrors()
