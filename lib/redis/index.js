'use strict'

const redis = require('redis')

const _redis = redis.createClient(C.redis.port, C.redis.host)

_redis.on('connect', () => {
  log.info('Redis connected')
})

global._redis = _redis
