'use strict'

const _    = require('lodash')
const amqp = require('amqplib/callback_api')

const RequestNamespace    = require('../../requestNamespace')
const getRequestNamespace = require('../../getRequestNamespace')

const splitOnce = (s, delimiter) => {
  const i = s.indexOf(delimiter) ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Msg {
  constructor(channel, msg) {
    this.channel = channel
    const json   = msg.content.toString()
    this.object  = JSON.parse(json)
    this.headers = msg.properties.headers
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
    this.channel    = null
    this.connection = null
    this.timeout    = timeout || 500

    this.uri    = config.uri
    this.queues = {}
    this.topics = {}

    _.forEach(handlers, (handler, name) => {
      const isTopic  = _.includes(name, '.')

      if (isTopic) {
        this.topics[name] = handler

      } else {
        this.queues[name] = handler

      }
    })
  }

  _connect() {
    amqp.connect(this.uri, (err, conn) => {
      if (err) {
        log.error('[msg] Error:', err.message)
        return setTimeout(this._connect, this.timeout)
      }

      conn.on('error', err => {
        if (err.message !== 'Connection closing') {
          log.error('[msg] Error:', err.message)
        }
      })

      conn.on('close', () => {
        log.error('[msg] Reconnecting')
        return setTimeout(this._connect, this.timeout)
      })

      conn.createChannel((err, ch) => {
        if (err) {
          log.error('[msg] Error:', err.message)
          return conn.close()
        }

        ch.on('error', (err) => log.error('[msg] Error:', err.message))

        ch.on('close', () => log.info('[msg] Channel closed'))

        this.channel = ch
        log.info('[msg] Channel created')

        this.afterConnect()
      })

      this.connection = conn
      log.info('[msg] Connected:', this.uri)
    })
  }

  _listenQueues() {
    _.forEach(this.queues, (handler, qname) => {
      log.info('[msg] Listening', qname)

      this.channel.assertQueue(qname, { durable: false }, error => {
        if (error) {
          log.error('[msg] Error:', error.message)
          return this.connection.close()
        }

        return this.channel.consume(qname, message => {
          const msg = new Msg(qname, message)
          msg.exec(handler, () => this.channel.ack(message))
        })
      })
    })
  }

  _listenTopics() {
    _.forEach(this.topics, (handler, address) => {
      const [ topic, routingKey ] = splitOnce(address, '.')

      log.info('[msg] Listening', address)

      this.channel.assertExchange(topic, 'topic', { durable: false })
      this.channel.assertQueue('', { exclusive: true }, (err, q) => {
        this.channel.bindQueue(q.queue, topic, routingKey)
        this.channel.consume(q.queue, message => {
          const msg = new Msg(address, message)
          msg.exec(handler)
        }, { noAck: false })
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
