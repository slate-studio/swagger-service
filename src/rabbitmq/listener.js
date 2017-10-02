'use strict'

const RequestNamespace = require('../utils/requestNamespace')
const amqp = require('amqplib/callback_api')

class Listener {
  constructor({ uri, handlers, timeout }) {
    this.channel    = null
    this.connection = null
    this.timeout    = timeout || 500

    this.uri    = uri || C.rabbitmq.uri
    this.queues = {}
    this.topics = {}

    _.forEach(handlers, (handler, name) => {
      const isTopic  = _.includes(name, '.')
      const callback = msg => this._createRequestNamespace(msg, handler)

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
        log.error('Rabbitmq error:', err.message)
        return setTimeout(this._connect, this.timeout)
      }

      conn.on('error', err => {
        if (err.message !== 'Connection closing') {
          log.error('Rabbitmq error:', err.message)
        }
      })

      conn.on('close', () => {
        log.error('Rabbitmq reconnecting')
        return setTimeout(this._connect, this.timeout)
      })

      conn.createChannel((err, ch) => {
        if (err) {
          log.error('Rabbitmq error:', err.message)
          return conn.close()
        }

        ch.on('error', (err) => log.error('Rabbitmq error:', err.message))

        ch.on('close', () => log.info('Rabbitmq channel closed'))

        this.channel = ch
        log.info('Rabbitmq channel created')

        this.afterConnect()
      })

      this.connection = conn
      log.info('Rabbitmq connected:', this.uri)
    })
  }

  _createRequestNamespace(msg, callback) {
    const authenticationToken = _
      .get(msg, 'properties.headers.authenticationToken', null)

    if (!authenticationToken) {
      log.error('Rabbitmq: authenticationToken header is not defined, ignoring message.')

      // NOTE: Close invalid queue message to do not re-read it again.
      return this.channel.ack(msg)
    }

    const headers = { 'x-authentication-token': authenticationToken }

    msg.requestNamespace = new RequestNamespace(headers)
    msg.requestNamespace.save({}, () => callback(msg, this.channel))
    console.log('MESSAGE', msg)
  }

  _listenQueues() {
    _.forEach(this.queues, (callback, queue) => {
      this.channel.assertQueue(queue, { durable: false }, error => {
        if (error) {
          log.error('Rabbitmq error:', error.message)
          return this.connection.close()
        }

        return this.channel.consume(queue, callback.bind(null, this.channel))
      })
    })
  }

  _listenTopics() {
    _.forEach(this.topics, (callback, topic) => {
      const name       = topic.split('.')[0]
      const routingKey = topic.replace(`${name}.`, '')

      this.channel.assertExchange(name, 'topic', { durable: false })
      this.channel.assertQueue('', { exclusive: true }, (err, q) => {
        this.channel.bindQueue(q.queue, name, routingKey)
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
