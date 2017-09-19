'use strict'

const uri                     = C.rabbitmq.uri
const amqp                    = require('amqplib')
const requestNamespaceUtility = require('../../utils/requestNamespace')

const send = (queueName, object, authenticationToken) => {
  let connection
  let channel

  return amqp.connect(uri)
    .then(conn => {
      connection = conn
      return connection.createChannel()
    })
    .then(ch => {
      channel = ch
      return channel.assertQueue(queueName, { durable: false })
    })
    .then(() => {
      const json    = JSON.stringify(object)
      const buffer  = new Buffer(json)
      const options = { headers: { authenticationToken } }

      log.info(`[AMQP] Send to ${queueName}: ${object}`)
      return channel.sendToQueue(queueName, buffer, options)
    })
    .then(() => channel.close())
    .finally(() => connection.close())
    .catch(log.error)

}

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = exports = (queueName, object) => {
  const requestNamespace    = requestNamespaceUtility.getRequestNamespace()
  const authenticationToken = requestNamespace.get('authenticationToken')

  return send(queueName, object, authenticationToken)
}
exports.send = send