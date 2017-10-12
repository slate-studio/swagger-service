'use strict'

const RequestNamespace = require('../requestNamespace')
const Bunyan           = require('bunyan')
const streams          = require('./streams')

const rootPath = process.cwd()
const pkg      = require(`${rootPath}/package.json`)
const version  = pkg.version

const name  = process.env.PROCESS_NAME || _.get(C, 'service.name', 'NO_NAME')
const level = _.get(C, 'log.level', 'info')
const keys  = _.get(C, 'log.requestNamespaceKeys', [])

const serializers = Bunyan.stdSerializers
const bunyan      = new Bunyan({ name, level, streams, serializers })

const bunyanRequestIdChild = () => {
  const requestNamespace = new RequestNamespace()
  let namespace = requestNamespace.getAll()

  if (!_.isEmpty(keys)) {
    namespace = _.pick(namespace, keys)
  }

  const metadata = _.get(C, 'log.metadata', {})

  namespace = _.extend(namespace, metadata)
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
