'use strict'

const Logger   = require('bunyan')
const logstash = require('bunyan-logstash')

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

global.log = log
