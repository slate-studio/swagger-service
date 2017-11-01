'use strict'

const _ = require('lodash')

const rmq   = require('./rmq')
const redis = require('./redis')

class Msg {
  constructor(config) {
    this._config = config
    this.globals = {}
  }

  connect() {
    const rmqConfig = _.get(this._config, 'rabbitmq', null)
    if (rmqConfig != null) {
      return rmqSetup(rmqConfig)
    }

    const redisConfig = _.get(this._config, 'redis', null)
    if (redisConfig != null) {
      return redisSetup(redisConfig)
    }

    log.warn('[msg] No configuration defined, messaging is not supported')

    return Promise.resolve(this)
  }

  rmqSetup(config) {
    log.info('[msg] Use rabbitmq:', config)

    const connect = require('../rabbitmq')
    return connect(config, 500)
      .then(({ connection, channel }) => {
        const Message  = (object, headers) => {
          return new rmq.Message(connection, channel, object, headers)
        }
        const Listener = (handlers, timeout) => {
          return new rmq.Listener(connection, channel, handlers)
        }
        this.globals = { Message, Listener, Msg: rmq.Msg }
        return this
      })

  }

  redisSetup(config) {
    log.info('[msg] Use redis:', config)

    const connect = require('../db/redis').connect
    return connect(config)
      .then(client => {
        const Message  = (object, headers) => new redis.Message(client, object, headers)
        const Listener = (handlers, timeout) => new redis.Listener(client, handlers)
        this.globals = { Message, Listener, Msg: redis.Msg }
        return this
      })
  }
}

exports = module.exports = config => {
  if (!global['log']) {
    throw new Error('Logger has to be initialized, `global.log` is not defined')
  }

  const msg = new Msg(config)

  return msg.connect()
}

exports.Msg = Msg
