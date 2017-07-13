'use strict'

global.Promise = require('bluebird')
global._       = require('lodash')

const cls       = require('continuation-local-storage')
const namespace = cls.createNamespace('loggerNamespace')
require('cls-bluebird')(namespace)

const Logger   = require('bunyan')
const logstash = require('bunyan-logstash')

const logstashConfig = _.extend({
  application: C.service.name,
  level:       'debug',
}, C.logstash)

const logstashStream = logstash.createStream(logstashConfig)

const bunyan = new Logger({
  name: C.service.name,
  streams: [
    {
      level: 'debug',
      stream: process.stdout
    },
    {
      level: 'info',
      path: 'logs/info.log'
    },
    {
      level: 'debug',
      path: 'logs/debug.log'
    }
  ]
})

bunyan.addStream({ type: 'raw', stream: logstashStream })

const log = {}

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

log.trace = (...args) => bunyan.trace(...extendObjectWithRequestId(...args))

log.debug = (...args) => bunyan.debug(...extendObjectWithRequestId(...args))

log.info = (...args) => bunyan.info(...extendObjectWithRequestId(...args))

log.warn = (...args) => bunyan.warn(...extendObjectWithRequestId(...args))

log.error = (...args) => bunyan.error(...extendObjectWithRequestId(...args))

log.fatal = (...args) => bunyan.fatal(...mergeObjectWithRequestId(...args))

global.log = log
