'use strict'

const bluebird = require('bluebird')
const redis    = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const connect = () => {
  return new Promise(resolve => {
    const { host, port } = _.get(C, 'redis')
    const client = redis.createClient(port, host)

    log.info(`Connect redis at ${host}:${port}`)
    client.on('ready', () => resolve(client))
  })
}

exports = module.exports = connect
