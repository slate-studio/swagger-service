'use strict'

const _ = require('lodash')

const rmq   = require('./rmq')
const redis = require('./redis')

class Msg {
  constructor(config) {
    this.rmqSetup(config)
    if (this.globals) {
      return
    }

    this.redisSetup(config)
    if (this.globals) {
      return
    }

    this.globals = {}
    log.warn('[msg] No configuration defined, messaging is not supported')
  }

  rmqSetup(config) {
    this.config = _.get(config, 'rabbitmq')

    if (this.config) {
      log.info('[msg] Use rabbitmq:', this.config)
      const Message  = (object, headers) => new rmq.Message(this.config, object, headers)
      const Listener = (handlers, timeout) => new rmq.Listener(this.config, handlers, timeout)
      this.globals = { Message, Listener, Msg: rmq.Msg }
    }
  }

  redisSetup(config) {
    this.config = _.get(config, 'redis')

    if (this.config) {
      log.info('[msg] Use redis: ', this.config)
      const Message  = (object, headers) => new redis.Message(this.config, object, headers)
      const Listener = (handlers, timeout) => new redis.Listener(this.config, handlers, timeout)
      this.globals = { Message, Listener, Msg: redis.Msg }
    }
  }

  connect() {
    return Promise.resolve()
      .then(() => this)
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
