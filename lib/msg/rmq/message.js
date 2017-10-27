'use strict'

const amqp = require('amqplib')
const RequestNamespace = require('../utils/requestNamespace')

const splitOnce = str => {
  const i = s.indexOf('|')
  return [ s.slice(0, i), s.slice(i + 1) ]
}

class Message {
  constructor(config, object) {
    const json = JSON.stringify(object)

    this.config           = config
    this.buffer           = new Buffer(json)
    this.requestNamespace = new RequestNamespace()

    const { authenticationToken, requestId } = requestNamespace.getAll()

    const headers = {
      'x-authentication-token': authenticationToken,
      'x-request-id':           requestId
    }

    this.options = { headers }
  }

  publish(address) {
    const [ topic, key ] = splitOnce(address)

    let connection
    let channel

    return amqp.connect(this.config.uri)
      .then(conn => {
        connection = conn
        return connection.createChannel()
      })
      .then(ch => {
        channel = ch
        return channel.assertExchange(topic, 'topic', { durable: false })
      })
      .then(() => {
        log.info('[rabbitmq] Publish', address, object)
        return channel.publish(topic, key, this.buffer, this.options)
      })
      .then(() => channel.close())
      .finally(() => connection.close())
      .catch(log.error)
  }

  send(queue) {
    let connection
    let channel

    return amqp.connect(this.config.uri)
      .then(conn => {
        connection = conn
        return connection.createChannel()
      })
      .then(ch => {
        channel = ch
        return channel.assertQueue(queue, { durable: false })
      })
      .then(() => {
        log.info('[rabbitmq] Send', queue, object)
        return channel.sendToQueue(queue, this.buffer, this.options)
      })
      .then(() => channel.close())
      .finally(() => connection.close())
      .catch(log.error)
  }
}

module.exports = Message
