'use strict'

global.Promise  = require('bluebird')
global._        = require('lodash')

const _rootPath = require('app-root-path')
const _version  = require(`${_rootPath}/package.json`).version

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

const bunyan = new Logger({
  name:    C.service.name,
  streams: [
    {
      type:   'stream',
      level:  'debug',
      stream: udpStream
    },
    {
      level:  'debug',
      stream: process.stdout
    }
  ]
})

bunyan.level('debug')

const bunyanRequestIdChild = () => {
  const requestId  = namespace.get('requestId') || ''
  return bunyan.child({ requestId: requestId, version: _version })
}

global.log = {
  'trace': (...args) => bunyanRequestIdChild().trace(...args),
  'debug': (...args) => bunyanRequestIdChild().debug(...args),
  'info':  (...args) => bunyanRequestIdChild().info(...args),
  'warn':  (...args) => bunyanRequestIdChild().warn(...args),
  'error': (...args) => bunyanRequestIdChild().error(...args),
  'fatal': (...args) => bunyanRequestIdChild().fatal(...args)
}

logUnhandledErrors()
