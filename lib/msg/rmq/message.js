'use strict'

const connect = require('./connect')
const RequestNamespace = require('../../requestNamespace')

const splitOnce = (s, delimiter) => {
  const i = s.indexOf(delimiter) ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Message {
  constructor(config, object) {
    const requestNamespace = new RequestNamespace()
    const json = JSON.stringify(object)

    this.object = object
    this.config = config
    this.buffer = new Buffer(json)

    const { authenticationToken, requestId } = requestNamespace.getAll()
    const headers = { authenticationToken, requestId }
    this.options  = { headers }
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
