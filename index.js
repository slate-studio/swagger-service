'use strict'

global._ = require('lodash')
global.C = require('config')

const logger = require('./lib/log')
const db     = require('./lib/db')
const api    = require('./lib/api')

exports.db  = db
exports.api = api
exports.utils = require('./src/utils')

exports.listen = () => {
  const server = require('express')()
  const port   = _.get(C, 'service.port', 3000)

  const buildApiClient = require('./src/swagger/client')

  logger()
    .then(() => buildApiClient())
    .then(() => {
      if (db.redis) {
        return db.redis().then(client => db.redis = client)
      }
    })
    .then(() => {
      if (db.mongodb) {
        return db.mongodb()
      }
    })
    .then(() => {
      server.use(api.responseTime())

      server.use(api.namespace)

      server.use((req, res, next) => {
        log.info(req.method, req.url)
        next()
      })

      server.use('/', api.health)

      return api.oas(server)
        .then(() => {
          server.use((error, req, res, next) => {
            log.error(error)

            const response = _.pick(error, [ 'name', 'message', 'stack' ])
            res.status(500).json(response)
          })
        })
    })
    .then(() => {
      log.info(`[api] Listening on port ${port}`)
      server.listen(port, callback => server.emit('started', callback))
    })
    .catch(error => {
      log.fatal('[api] Initialization error: ', error)
      process.exit(1)
    })

  return server
}
