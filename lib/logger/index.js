'use strict'

const cls       = require('continuation-local-storage')
const Logger    = require('bunyan')
const logstash  = require('bunyan-logstash')
const namespace = cls.getNamespace('requestNamespace')

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

const logProxy = {}

const isObject = o => {return (o !== null && typeof o === 'object' && !Array.isArray( o ))}

const mergeObjectWithRequestId = (...args) => {

  const requestId = namespace.get('requestId')

  if (args[0] && requestId) {
    if (isObject(args[0])) {
      args[0]['requestId'] = requestId
      return args

    } else {
      return _.concat([{ requestId: requestId }], args)
    }
  }
  return args
}

logProxy.trace = (...args) =>{
  return bunyan.trace(...mergeObjectWithRequestId(...args))
}

logProxy.debug = (...args) =>{
  return bunyan.debug(...mergeObjectWithRequestId(...args))
}

logProxy.info = (...args) => {
  return bunyan.info(...mergeObjectWithRequestId(...args))
}

logProxy.warn = (...args) =>{
  return bunyan.warn(...mergeObjectWithRequestId(...args))
}

logProxy.error = (...args) =>{
  return bunyan.error(...mergeObjectWithRequestId(...args))
}

logProxy.fatal = (...args) =>{
  return bunyan.fatal(...mergeObjectWithRequestId(...args))
}

global.log = logProxy

