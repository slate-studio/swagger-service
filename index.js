'use strict'

global.Promise  = require('bluebird')
global._        = require('lodash')
global.C        = require('config')
global.log      = require('./src/log')
global.api      = null
global.redis    = null
global.mongoose = null
global.Models   = null
global.Services = null

const api      = require('./lib/api')
const errors   = require('./src/errors')
const redis    = require('./src/redis')
const mongodb  = require('./src/mongodb')
const server   = require('./src/server')
const rabbitmq = require('./src/rabbitmq')
const utils    = require('./src/utils')

exports = module.exports = () => {
  const service  = require('express')()
  const buildApi = require('./src/swagger/client')

  Promise.resolve()
    .then(log.setMetadata)
    .then(buildApi)
    .then(redis)
    .then(mongodb)
    .then(() => server(service))
    .catch(error => {
      log.error('Service initialization error: ', error)
      process.exit(1)
    })

  return service
}

exports.errors   = errors
exports.redis    = redis
exports.mongodb  = mongodb
exports.server   = server
exports.rabbitmq = rabbitmq
exports.utils    = require('./src/utils')

exports.api      = api
