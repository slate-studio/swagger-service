'use strict'

global._ = require('lodash')
global.C = require('config')

const logger       = require('../../log')
const db           = require('../../db')
const health       = require('./health')
const namespace    = require('./namespace')
const oas          = require('./oas')
const responseTime = require('response-time')

module.exports = () => {
  const server   = require('express')()
  const port     = _.get(C, 'service.port', 3000)
  const rootPath = process.cwd()
  const specPath = `${rootPath}/api/swagger.json`

  const buildApiClient = require('../../../src/swagger/client')

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
      server.use(responseTime())
      server.use('/', health)
      server.get('/swagger', (req, res) => res.sendFile(specPath))

      server.use(namespace)

      server.use((req, res, next) => {
        log.info(req.method, req.url)
        next()
      })

      return oas(server)
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
