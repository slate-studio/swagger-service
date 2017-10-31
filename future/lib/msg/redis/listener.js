'use strict'

const _ = require('lodash')

const RSMQWorker = require('rsmq-worker')
const connect    = require('../../db/redis')

const RequestNamespace    = require('../../requestNamespace')
const getRequestNamespace = require('../../getRequestNamespace')

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

      if (next) {
        next()
      }

      return
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
    const redis  = this.client.duplicate()
    this.workers = {}

    _.forEach(this.queues, qname => this._createWorker(redis, qname))
  }

  _createWorker(redis, qname) {
    const worker  = new RSMQWorker(qname, { redis })
    const handler = this.handlers[qname]

    worker.on('message', (message, next, id) => {
      const msg = new Msg(qname, message)
      msg.exec(handler, next)
    })

    // NOTE: Raw message format
    // A message ( e.g. received by the event data or customExceedCheck )
    // contains the following keys:
    // msg.message: ( String ) The queue message content. You can use complex
    //              content by using a stringified JSON.
    // msg.id: ( String ) The rsmq internal message id
    // msg.sent: ( Number ) Timestamp of when this message was sent / created.
    // msg.fr: ( Number ) Timestamp of when this message was first received.
    // msg.rc: ( Number ) Number of times this message was received.
    worker.on('error', (err, msg) => log.error('[msg] Error', err, msg.id))
    worker.on('exceeded', msg => log.error('[msg] Exceeded', msg.id))
    worker.on('timeout', msg => log.error('[msg] Timeout', msg.id, msg.rc))
    worker.on('ready', () => log.info('[msg] Listen queue', qname))

    worker.start()

    this.workers[qname] = worker
  }

  listen() {
    return connect(this.config)
      .then(client => this.client = client)
      .then(() => this._listenTopics())
      .then(() => this._listenQueues())
  }
}

module.exports = Listener
