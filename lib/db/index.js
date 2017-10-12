'use strict'

const MONGODB_URI  = _.get(C, 'mongodb.uri')
const REDIS_CONFIG = _.get(C, 'redis')

if (MONGODB_URI) {
  exports.mongodb = require('./mongodb')
}

if (REDIS_CONFIG) {
  exports.redis = require('./redis')
}
