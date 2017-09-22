'use strict'

const amqp             = require('amqplib')
const RequestNamespace = require('../../utils/requestNamespace')

const publish = (topicName, key, object, authenticationToken) => {
  const uri = C.rabbitmq.uri

  let connection
  let channel

  return amqp.connect(uri)
    .then(conn => {
      connection = conn
      return connection.createChannel()
    })
    .then(ch => {
      channel = ch
      return channel.assertExchange(topicName, 'topic', { durable: false })
    })
    .then(() => {
      const json   = JSON.stringify(object)
      const buffer = new Buffer(json)
      const options = { headers: { authenticationToken } }

      log.info('[AMQP] Publish', `${topicName}.${key}: ${object}`)
      return channel.publish(topicName, key, buffer, options)
    })
    .then(() => channel.close())
    .finally(() => connection.close())
    .catch(log.error)
}

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = exports = (topicName, key, object) => {
  const requestNamespace    = new RequestNamespace()
  const authenticationToken = requestNamespace.get('authenticationToken')

  return publish(topicName, key, object, authenticationToken)
}
exports.publish = publish
