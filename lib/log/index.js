'use strict'

const _ = require('lodash')

const Bunyan           = require('bunyan')
const RequestNamespace = require('../requestNamespace')
const createStreams    = require('./streams')
const getMetadata      = require('./getMetadata')

const processName = process.env.PROCESS_NAME
const serializers = Bunyan.stdSerializers
const rootPath    = process.cwd()

class Logger {
  constructor(config) {
    this.config   = _.get(config, 'log', {})
    this.version  = require(`${rootPath}/package.json`).version
    this.metadata = {}

    const name    = processName || _.get(config, 'service.name', 'NO_NAME')
    const level   = _.get(this.config, 'level', 'info')
    const streams = createStreams(this.config)

    this.bunyan = new Bunyan({ name, level, streams, serializers })
  }

  setMetadata() {
    this.info('[logger] Set environment metadata')

    return getMetadata()
      .then(metadata => this.metadata = metadata)
  }

  bunyanChild() {
    const requestNamespace = new RequestNamespace()

    let namespace = requestNamespace.getAll()
    const keys    = _.get(this.config, 'requestNamespaceKeys', [])

    namespace = _.pick(namespace, keys)
    namespace = _.extend(namespace, this.metadata)
    namespace.version = this.version

    return this.bunyan.child(namespace)
  }

  trace(...args) {
    return this.bunyanChild().trace(...args)
  }

  debug(...args) {
    return this.bunyanChild().debug(...args)
  }

  info(...args) {
    return this.bunyanChild().info(...args)
  }

  warn(...args) {
    return this.bunyanChild().warn(...args)
  }

  error(...args) {
    return this.bunyanChild().error(...args)
  }

  fatal(...args) {
    return this.bunyanChild().fatal(...args)
  }
}

exports = module.exports = config => {
  if (global.log) {
    return Promise.resolve()
  }

  global.log = new Logger(config)

  process.on('uncaughtException', err => {
    new Promise((resolve) => {
      log.fatal('Uncaught exception:', err)
      resolve()
    }).then(() => process.exit(1))
  })

  process.on('unhandledRejection', (reason, p) => {
    log.fatal('Unhandled rejection at:', p, 'reason:', reason)
    setImmediate(() => process.exit(1))
  })

  return log.setMetadata()
}
