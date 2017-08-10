'use strict'

const bluebird = require('bluebird')
const redis    = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const connect = () => {
  return new Promise((resolve) => {
    if (C.redis) {
      const host = C.redis.host
      const port = C.redis.port

      const client = redis.createClient(port, host)

      log.info(`Connect redis at ${host}:${port}`)
      client.on('ready', resolve)

      global.redis = client

    } else {
      resolve()

    }
  })
}

exports = module.exports = connect
