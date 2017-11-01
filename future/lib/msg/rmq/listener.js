'use strict'

const _    = require('lodash')
const amqp = require('amqplib/callback_api')
const Msg  = require('./msg')

const splitOnce = (s, delimiter) => {
  const i = s.indexOf(delimiter) ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Listener {
  constructor(connection, channel, handlers) {
    this.connection = connection
    this.channel    = channel

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
    return Promise.resolve()
      .then(() => this._listenTopics())
      .then(() => this._listenQueues())
  }
}

module.exports = Listener
