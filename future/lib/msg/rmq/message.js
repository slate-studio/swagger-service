'use strict'

const amqp = require('amqplib')
// const RequestNamespace  = require('../../requestNamespace')
const RequestNamespace2 = require('../../../../src/utils/requestNamespace')

const splitOnce = (s, delimiter) => {
  const i = s.indexOf(delimiter) ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Message {
  constructor(config, object) {
    // const requestNamespace = new RequestNamespace()
    const json = JSON.stringify(object)

    this.object = object
    this.config = config
    this.buffer = new Buffer(json)

    // const { authenticationToken, requestId } = requestNamespace.getAll()

    const requestNamespace    = new RequestNamespace2()
    const authenticationToken = requestNamespace.get('authenticationToken')
    const requestId           = requestNamespace.get('requestId')

    const headers = { authenticationToken, requestId }
    this.options  = { headers }
  }

  publish(address) {
    const [ topic, key ] = splitOnce(address, '.')

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
        log.info('[msg] Publish to', address, this.object)
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
        log.info('[msg] Send to', queue, this.object)
        return channel.sendToQueue(queue, this.buffer, this.options)
      })
      .then(() => channel.close())
      .finally(() => connection.close())
      .catch(log.error)
  }
}

module.exports = Message
