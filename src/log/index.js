'use strict'

// TODO: This should probably move to RequestNamespace class.
const cls       = require('continuation-local-storage')
const namespace = cls.createNamespace('requestNamespace')
require('cls-bluebird')(namespace)

const rootPath = process.cwd()
const pkg      = require(`${rootPath}/package.json`)
const version  = pkg.version
const Bunyan   = require('bunyan')

// STREAMS ====================================================================

const stdout = require('./_stdout')()
let streams = [ stdout ]

const isFirehoseEnabled = _.get(C, 'log.firehose')
if (isFirehoseEnabled) {
  const firehose = require('./_firehose')()
  streams.push(firehose)
}

const isLogstashEnabled = _.get(C, 'log.logstash')
if (isLogstashEnabled) {
  const logstash = require('./_logstash')()
  streams.push(logstash)
}

streams = _.compact(streams)

// LOGGER =====================================================================

const name  = process.env.PROCESS_NAME || _.get(C, 'service.name', 'NO_NAME')
const level = _.get(C, 'log.level', 'info')

const serializers = Bunyan.stdSerializers

const bunyan = new Bunyan({ name, level, streams, serializers })

const bunyanRequestIdChild = () => {
  // TODO: namespace should be created here using new RequestNamespace class.
  const requestId = namespace.get('requestId') || ''
  const userId    = namespace.get('userId')    || ''

  const metadata = _.get(C, 'log.metadata', {})
  const config   = _.extend({ requestId, userId, version }, metadata)

  return bunyan.child(config)
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
  new Promise((resolve) => {
    log.fatal('Uncaught exception:', err)
    resolve()
  }).then(res => process.exit(1))
})

process.on('unhandledRejection', (reason, p) => {
  log.fatal('Unhandled rejection at:', p, 'reason:', reason)
  setImmediate(() => process.exit(1))
})

exports = module.exports = log
exports.setMetadata = require('./setMetadata')
