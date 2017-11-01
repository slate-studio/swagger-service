'use strict'

const amqp             = require('amqplib')
// const RequestNamespace = require('../../../../src/utils/requestNamespace')
const RequestNamespace2 = require('../../../../src/utils/requestNamespace')

const splitOnce = (s, delimiter) => {
  const i = s.indexOf(delimiter) ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Message {
  constructor(connection, channel, object) {
    this.connection = connection
    this.channel    = channel
    this.object     = object

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

    this.channel.assertExchange(topic, 'topic', { durable: false })
    this.channel.publish(topic, routingKey, this.buffer, this.options)

    return Promise.resolve()
  }

  send(queue) {
    log.info('[msg] Send to', queue, this.object)

    this.channel.assertQueue(queue, { durable: false })
    this.channel.sendToQueue(queue, this.buffer, this.options)

    return Promise.resolve()
  }
}

module.exports = Message
