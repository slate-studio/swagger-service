'use strict'

const logger   = require('../../log')
const bluebird = require('bluebird')
const redis    = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const connect = () => {
  return new Promise(resolve => {
    const { host, port } = _.get(C, 'redis')
    const client = redis.createClient(port, host)

    log.info(`[redis] Connected: ${host}:${port}`)
    client.on('ready', () => resolve(client))
  })
}

exports = module.exports = () => logger().then(connect)
