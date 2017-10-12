'use strict'

global._   = require('lodash')
global.C   = require('config')
global.log = require('./lib/log')

global.api      = null
global.redis    = null
global.mongoose = null
global.Models   = null
global.Services = null

const api = require('./lib/api')
const db  = require('./lib/db')

const errors   = require('./src/errors')
const server   = require('./src/server')
const rabbitmq = require('./src/rabbitmq')
const utils    = require('./src/utils')

exports = module.exports = () => {
  const service  = require('express')()
  const buildApi = require('./src/swagger/client')

  Promise.resolve()
    .then(log.setMetadata)
    .then(buildApi)
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
    .then(() => server(service))
    .catch(error => {
      log.fatal('Service initialization error: ', error)
      process.exit(1)
    })

  return service
}

exports.errors   = errors
exports.server   = server
exports.rabbitmq = rabbitmq
exports.utils    = require('./src/utils')

exports.api = api
exports.db  = db

