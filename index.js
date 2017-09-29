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

const errors   = require('./src/errors')
const redis    = require('./src/redis')
const mongodb  = require('./src/mongodb')
const express  = require('./src/express')
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
    .then(() => express(service))
    .catch(error => {
      log.error('Service initialization error: ', error)
      process.exit(1)
    })

  return service
}

exports.errors   = errors
exports.redis    = redis
exports.mongodb  = mongodb
exports.express  = express
exports.rabbitmq = rabbitmq
exports.utils    = require('./src/utils')
