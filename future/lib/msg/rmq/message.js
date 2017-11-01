'use strict'

const amqp             = require('amqplib')
const RequestNamespace = require('../../../../src/utils/requestNamespace')

const splitOnce = (s, delimiter) => {
  const i = s.indexOf(delimiter) ; return [ s.slice(0, i), s.slice(i + 1) ]
}

class Message {
  constructor(connection, channel, object, headers={}) {
    this.connection = connection
    this.channel    = channel
    this.object     = object

    if (_.isEmpty(headers)) {
      const requestNamespace    = new RequestNamespace2()
      const authenticationToken = requestNamespace.get('authenticationToken')
      const requestId           = requestNamespace.get('requestId')
      headers                   = { authenticationToken, requestId }
    }

    this.options = { headers }
    const json = JSON.stringify(this.object)
    this.buffer = new Buffer(json)
  }

  publish(address) {
    const [ topic, key ] = splitOnce(address, '.')

    return this.channel.assertExchange(topic, 'topic', { durable: false })
      .then(() => {
        log.info('[msg] Publish to', address, this.object)
        return channel.publish(topic, key, this.buffer, this.options)
      })
      .finally(() => channel.close())
      .catch(log.error)
  }

  send(queue) {
    return this.channel.assertQueue(queue, { durable: false })
      .then(() => {
        log.info('[msg] Send to', queue, this.object)
        return channel.sendToQueue(queue, this.buffer, this.options)
      })
      .finally(() => channel.close())
      .catch(log.error)
  }
}

module.exports = Message
