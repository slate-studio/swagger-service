'use strict'

// TODO: This should probably move to RequestNamespace class.
const cls       = require('continuation-local-storage')
const namespace = cls.createNamespace('requestNamespace')
require('cls-bluebird')(namespace)

const processName = process.env.PROCESS_NAME
const rootPath    = require('app-root-path')
const pkg         = require(`${rootPath}/package.json`)
const version     = pkg.version
const Bunyan      = require('bunyan')

const RequestNamespace = require('../utils/requestNamespace')

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

const name  = processName || _.get(C, 'service.name', 'NO_NAME')
const level = _.get(C, 'log.level', 'info')
const serializers = Bunyan.stdSerializers

const bunyan = new Bunyan({ name, level, streams, serializers })

const bunyanRequestIdChild = () => {
  const requestNamespace = new RequestNamespace()
  const metadata         = _.get(C, 'log.metadata', {})
  const keys             = _.get(C, 'log.requestNamespaceKeys', [])
  let namespace          = {}

  _.forEach(keys, key => {
    namespace[key] = requestNamespace.get(key) || ''
  })

  namespace = _.assign(namespace, metadata)
  namespace.version = version
  return bunyan.child(namespace)
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
  log.fatal('Uncaught exception:', err)
  setTimeout(() => process.exit(1), 1000)
})

process.on('unhandledRejection', (reason, p) => {
  log.fatal('Unhandled rejection at:', p, 'reason:', reason)
  setTimeout(() => process.exit(1), 1000)
})

exports = module.exports = log
exports.setMetadata = require('./setMetadata')
