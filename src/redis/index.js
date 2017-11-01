'use strict'

const bluebird = require('bluebird')
const redis    = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const connect = () => {
  return new Promise((resolve) => {
    if (C.redis) {
      const options = {
        host: C.redis.host,
        port: C.redis.port,
        enable_offline_queue: false,
        retry_strategy: (options) => {

          if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
          }
          return Math.min(options.attempt * 100, 3000);
        }
      }

      const client = redis.createClient(options)

      log.info(`Connect redis at ${host}:${port}`)
      client.on('ready', resolve)

      global.redis = client

    } else {
      resolve()

    }
  })
}

exports = module.exports = connect
