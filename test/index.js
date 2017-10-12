'use strict'

before(go => {
  global.C = {
    service: {
      name: 'service-test'
    },
    mongodb: {
      uri: 'mongodb://localhost:27017/service-test'
    },
    log: {
      level:    'debug',
      firehose: null,
      logstash: null
    }
  }

  global._   = require('lodash')
  global.log = require('../lib/log')

  const db = require('../lib/db')

  db.mongodb.drop()
    .then(() => db.mongodb())
    .then(() => go())
})

require('./mongodb')
// require('./rabbitmq')
