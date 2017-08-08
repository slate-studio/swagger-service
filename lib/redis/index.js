'use strict'

const redis = require('redis')

const connect = (callback) => {
  const _redis = redis.createClient(C.redis.port, C.redis.host)

  _redis.on('connect', () => {
    log.info('Redis connected')
    if (callback) {
      callback()
    }
  })

  global._redis = _redis
}

module.exports = {
  connect: connect
}