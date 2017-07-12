'use strict'

const cls = require('continuation-local-storage')
const Logger   = require('bunyan')
const logstash = require('bunyan-logstash')
const namespace = cls.getNamespace('requestNamespace')

const logstashConfig = _.extend({
  application: C.service.name,
  level:       'debug',
}, C.logstash)

const logstashStream = logstash.createStream(logstashConfig)

const log = new Logger({
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

log.addStream({ type: 'raw', stream: logstashStream })

const logProxy ={};

logProxy.trace = (...args) =>{
    log.trace(...args, {requestId: namespace.get('requestId')})
}

logProxy.debug = (...args) =>{
    log.debug(...args, {requestId: namespace.get('requestId')})
}
logProxy.info = (...args) =>{
    log.info(...args, {requestId: namespace.get('requestId')})
}
logProxy.warn = (...args) =>{
    log.warn(...args, {requestId: namespace.get('requestId')})
}
logProxy.error = (...args) =>{
    log.error(...args, {requestId: namespace.get('requestId')})
}
logProxy.fatal = (...args) =>{
    log.fatal(...args, {requestId: namespace.get('requestId')})
}

global.log = logProxy

