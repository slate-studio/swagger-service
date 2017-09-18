'use strict'

const uri  = C.rabbitmq.uri
const amqp = require('amqplib')
const cls  = require('continuation-local-storage')
const CustomRequestNamespace = require('../../utils/customRequestNamespace')

// TODO: When no connection this fails and doesn't retry sending the message.
// TODO: Get rid of requestNamespace={} param, create a separate method for
//       tests.
module.exports = (queueName, object, requestNamespace={}) => {
  if (_.isEmpty(requestNamespace)) {
    requestNamespace = cls.getNamespace('requestNamespace')

  } else {
    requestNamespace = new CustomRequestNamespace(requestNamespace)

  }

  const authenticationToken = requestNamespace.get('authenticationToken')

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
    .then(channel.close)
    .finally(connection.close)
    .catch(log.error)
}
