'use strict'

const RequestNamespace = require('../../requestNamespace')
const amqp = require('amqplib/callback_api')
const _ = require('lodash')

const splitOnce = s => {
  const i = s.indexOf('|') ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Listener {
  constructor(config, handlers, timeout) {
    this.channel    = null
    this.connection = null
    this.timeout    = timeout || 500

    this.uri    = config.uri
    this.queues = {}
    this.topics = {}

    _.forEach(handlers, (handler, name) => {
      const isTopic  = _.includes(name, '.')
      const callback = msg => {
        // NOTE: This might be implemented as a Msg class.
        const json  = msg.content.toString()
        msg.object  = JSON.parse(json)
        msg.headers = msg.properties.headers

        this._createRequestNamespace(msg, handler)
      }

      if (isTopic) {
        this.topics[name] = callback

      } else {
        this.queues[name] = callback

      }
    })
  }

  _connect() {
    amqp.connect(this.uri, (err, conn) => {
      if (err) {
        log.error('[rmq] Error:', err.message)
        return setTimeout(this._connect, this.timeout)
      }

      conn.on('error', err => {
        if (err.message !== 'Connection closing') {
          log.error('[rmq] Error:', err.message)
        }
      })

      conn.on('close', () => {
        log.error('[rmq] Reconnecting')
        return setTimeout(this._connect, this.timeout)
      })

      conn.createChannel((err, ch) => {
        if (err) {
          log.error('[rmq] Error:', err.message)
          return conn.close()
        }

        ch.on('error', (err) => log.error('[rmq] Error:', err.message))

        ch.on('close', () => log.info('[rmq] Channel closed'))

        this.channel = ch
        log.info('[rmq] Channel created')

        this.afterConnect()
      })

      this.connection = conn
      log.info('[rmq] Connected:', this.uri)
    })
  }

  _createRequestNamespace(msg, callback) {
    const authenticationToken = _.get(msg.headers, 'authenticationToken', null)
    const requestId           = _.get(msg.headers, 'requestId', null)

    // TODO: Check if we need to authenticate request.
    if (!authenticationToken) {
      log.error('[rmq] AuthenticationToken header is not defined, skiping message')

      // NOTE: Close invalid queue message to do not re-read it again.
      return this.channel.ack(msg)
    }

    // TODO: Unpack authenticationToken into the namespace, add requestId
    //       and authenticationToken to the namespace.
    const namespace = { authenticationToken, requestId }

    msg.requestNamespace = new RequestNamespace(namespace)
    msg.requestNamespace.save([], () => callback(msg, this.channel))
  }

  _listenQueues() {
    _.forEach(this.queues, (callback, queue) => {
      this.channel.assertQueue(queue, { durable: false }, error => {
        if (error) {
          log.error('[rmq] Error:', error.message)
          return this.connection.close()
        }

        return this.channel.consume(queue, callback)
      })
    })
  }

  _listenTopics() {
    _.forEach(this.topics, (callback, address) => {
      const [ topic, routingKey ] = splitOnce(address)

      this.channel.assertExchange(topic, 'topic', { durable: false })
      this.channel.assertQueue('', { exclusive: true }, (err, q) => {
        this.channel.bindQueue(q.queue, topic, routingKey)
        this.channel.consume(q.queue, callback, { noAck: false })
      })
    })
  }

  listen() {
    return new Promise((resolve) => {
      this.afterConnect = () => {
        this._listenQueues()
        this._listenTopics()

        resolve()
      }

      this._connect()
    })
  }
}

module.exports = Listener
