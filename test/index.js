'use strict'

global.C = {
  service: {
    name: 'test',
  },
  mongodb: {
    uri: 'mongodb://localhost:27017/swagger-service-test'
  },
  logstash: {
    host: '127.0.0.1',
    port: 5959
  }
}

require('../lib/logger')

const connectMongo = require('../lib/mongoose/connect')
connectMongo()
