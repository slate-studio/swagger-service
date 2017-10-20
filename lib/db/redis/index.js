'use strict'

const logger   = require('../../log')
const bluebird = require('bluebird')
const redis    = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const connect = config => {
  const { host, port } = config

  return new Promise(resolve => {
    const client = redis.createClient(port, host)

    log.info(`[redis] Connected: ${host}:${port}`)
    client.on('ready', () => resolve(client))
    client.on('error', error => log.error('[redis] Error:', error))
  })
}

exports = module.exports = config => {
  // TODO: Check if logger defined.
  return connect(config)
}
