'use strict'

const amqp             = require('amqplib')
// const RequestNamespace = require('../../../../src/utils/requestNamespace')
const RequestNamespace2 = require('../../../../src/utils/requestNamespace')
const connect = require('./connect')

const splitOnce = (s, delimiter) => {
  const i = s.indexOf(delimiter) ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Message {
  constructor(config, object) {
    this.config = config
    this.object = object

    const requestNamespace    = new RequestNamespace2()
    const authenticationToken = requestNamespace.get('authenticationToken')
    const requestId           = requestNamespace.get('requestId')
    const headers             = { authenticationToken, requestId }
    const json                = JSON.stringify(this.object)

    this.options = { headers }
    this.buffer = new Buffer(json)
  }

  publish(address) {
    log.info('[msg] Publish to', address, this.object)

    const [ topic, routingKey ] = splitOnce(address, '.')

    return connect(this.config)
      .then(({ connection, channel }) => {
        channel.assertExchange(topic, 'topic', { durable: false })
        channel.publish(topic, routingKey, this.buffer, this.options)
        channel.close()
      })
  }

  send(queue) {
    log.info('[msg] Send to', queue, this.object)

    return connect(this.config)
      .then(({ connection, channel }) => {
        channel.assertQueue(queue, { durable: false })
        channel.sendToQueue(queue, this.buffer, this.options)
        channel.close()
      })
  }
}

module.exports = Message
