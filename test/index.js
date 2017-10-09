'use strict'

before(go => {
  global.C = {
    service: {
      name: 'test'
    },
    mongodb: {
      uri: 'mongodb://localhost:27017/service-test'
    }
  }

  global.Promise = require('bluebird')
  global._       = require('lodash')
  global.log     = require('../src/log')
  const mongodb  = require('../src/mongodb')

  mongodb.drop()
    .then(() => mongodb())
    .then(() => go())
})

require('./mongodb')
// require('./rabbitmq')
