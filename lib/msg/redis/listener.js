'use strict'

const _ = require('lodash')

const connect = require('../../db/redis')

const RequestNamespace    = require('../../requestNamespace')
const getRequestNamespace = require('../../getRequestNamespace')

const BRPOP_DELAY_IN_SECONDS = 1

class Msg {
  constructor(channel, json) {
    this.channel = channel
    const source = JSON.parse(json)

    this.object  = source.object
    this.headers = source.headers
  }

  exec(callback, next) {
    const requestId           = _.get(this.headers, 'requestId', null)
    const authenticationToken = _.get(this.headers, 'authenticationToken', null)
    const namespace           = { requestId }

    // TODO: Implement support for authentication method.

    if (!authenticationToken) {
      log.error('[msg] AuthenticationToken header is not defined, skiping message')
      return next()
    }

    _.extend(namespace, getRequestNamespace(authenticationToken))

    this.requestNamespace = new RequestNamespace(namespace)
    this.requestNamespace.save([], () => callback(this, next))
  }
}

class Listener {
  constructor(config, handlers, timeout) {
    this.timeout  = timeout || 500
    this.config   = config
    this.queues   = []
    this.topics   = []
    this.handlers = handlers

    _.forEach(handlers, (handler, name) => {
      const isTopic = _.includes(name, '.')

      if (isTopic) {
        this.topics.push(name)

      } else {
        this.queues.push(name)

      }
    })
  }

  _listenTopics() {
    this.topicsClient = this.client.duplicate()

    this.topicsClient.on('message', (channel, message) => {
      const handler = this.handlers[channel]

      if (handler) {
        const msg = new Msg(channel, message)
        msg.exec(handler)
      }
    })

    _.forEach(this.topics, address => {
      log.info('[redis] Listen topic', address)
      this.topicsClient.subscribe(address)
    })
  }

  _listenQueues() {
    if (_.isEmpty(this.queues)) {
      return
    }

    const redis = this.client.duplicate()

    const next = () => log.info('[msg] Message handled')
    const args = _.clone(this.queues)
    args.push(BRPOP_DELAY_IN_SECONDS)

    const listen = () => {
      redis.brpopAsync(args)
        .then(value => {
          if (value) {
            const [ qname, message ] = value

            const msg     = new Msg(qname, message)
            const handler = this.handlers[qname]

            return msg.exec(handler, next)
          }
        })
        .finally(() => listen())
    }

    return listen()
  }

  listen() {
    return connect(this.config)
      .then(client => this.client = client)
      .then(() => this._listenTopics())
      .then(() => this._listenQueues())
  }
}

module.exports = Listener
