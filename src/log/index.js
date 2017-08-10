'use strict'

const rootPath = require('app-root-path')
const pkg      = require(`${rootPath}/package.json`)
const version  = pkg.version

const cls       = require('continuation-local-storage')
const namespace = cls.createNamespace('requestNamespace')
require('cls-bluebird')(namespace)

const Bunyan    = require('bunyan')
const bunyanUdp = require('@astronomer/bunyan-udp')

const streams = [
  {
    level:  C.stdoutLogLevel || 'debug',
    stream: process.stdout
  }
]

if (C.logstash && !C.logstash.disabled) {
  const udpStream = bunyanUdp.createStream({
    host: C.logstash.host,
    port: C.logstash.port || 5959
  })

  streams.push({
    type:   'stream',
    level:  'debug',
    stream: udpStream
  })
}

const bunyan = new Bunyan({
  name:    C.service.name,
  streams: streams,
  level:   'debug'
})

const bunyanRequestIdChild = () => {
  const requestId = namespace.get('requestId') || ''
  const userId    = namespace.get('userId')    || ''

  return bunyan.child({ requestId, userId, version })
}

const log = {
  'trace': (...args) => bunyanRequestIdChild().trace(...args),
  'debug': (...args) => bunyanRequestIdChild().debug(...args),
  'info':  (...args) => bunyanRequestIdChild().info(...args),
  'warn':  (...args) => bunyanRequestIdChild().warn(...args),
  'error': (...args) => bunyanRequestIdChild().error(...args),
  'fatal': (...args) => bunyanRequestIdChild().fatal(...args)
}

process.on('uncaughtException', err => {
  new Promise((resolve, reject) => {
    log.fatal('Uncaught exception:', err)
    resolve()
  }).then(res => process.exit(1))
})

process.on('unhandledRejection', (reason, p) => {
  log.fatal('Unhandled rejection at:', p, 'reason:', reason)
  setImmediate(() => process.exit(1))
})

module.exports = log
