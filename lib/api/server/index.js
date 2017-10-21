'use strict'

const _ = require('lodash')

const responseTime = require('response-time')
const express      = require('express')
const logger       = require('../../log')
const db           = require('../../db')
const health       = require('./health')
const oas          = require('./oas')

const connectDatabases = config => {
  const mongodbConfig = _.get(config, 'mongodb')
  const redisConfig   = _.get(config, 'redis')

  return Promise.resolve()
    .then(() => {
      if (mongodbConfig) {
        return db.mongodb(mongodbConfig)
          .then(({ globals }) => {
            global.Model  = globals.Model
            global.Schema = globals.Schema
          })
      }
    })
    .then(() => {
      if (redisConfig) {
        return db.redis(redisConfig)
          .then(client => global.redis = client)
      }
    })
}

const createServer = config => {
  const host = _.get(config, 'server.host')
  const port = _.get(config, 'server.port')
  const publicKey = _.get(config, 'service.publicKey')

  const server = express()

  server.set('port', port)
  server.set('publicKey', publicKey)
  server.use(responseTime())
  server.use('/', health)

  return new Promise(resolve => {
    oas(server, { host, port }, () => {
      server.use((error, req, res, next) => {
        log.error(error)

        const response = _.pick(error, [ 'name', 'message', 'stack' ])
        res.status(500).json(response)
      })

      resolve(server)
    })
  })
}

module.exports = config => {
  const buildApiClient = require('../../../src/swagger/client')

  return logger(config)
    .then(() => buildApiClient(config))
    .then(() => connectDatabases(config))
    .then(() => createServer(config))
    .then(api => {
      const port = api.get('port')

      log.info(`[api] Listening on port ${port}`)
      return new Promise(resolve => api.listen(port, () => resolve(api)))
    })
    .catch(error => {
      log.fatal('[api] Initialization error: ', error)
      process.exit(1)
    })
}
