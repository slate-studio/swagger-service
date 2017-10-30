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
    client.on('ready', () => resolve(client))
    client.on('error', error => log.error('[redis] Error:', error))
  })
}

exports = module.exports = config => {
  if (!global['log']) {
    throw new Error('Logger has to be initialized, `global.log` is not defined')
  }

  return connect(config)
}
