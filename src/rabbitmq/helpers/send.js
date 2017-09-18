'use strict'

const uri   = C.rabbitmq.uri
const amqp  = require('amqplib')
const cls   = require('continuation-local-storage')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (queueName, message, options = {}, logMessage = true) => {
  let namespace = {}

  if (_.isEmpty(options)) {
    namespace = cls.getNamespace('requestNamespace')
  } else {
    const utils = require('../../utils')
    namespace   = new utils.CustomRequestNamespace(options)
  }
  const authenticationToken = namespace.get('authenticationToken')

  return amqp.connect(uri)
    .then((conn) => {
      return conn.createChannel()
        .then((ch) => {
          const ok = ch.assertQueue(queueName, { durable: false })

          return ok.then(() => {
            const buffer = new Buffer(message)
            const options = {
              headers: { authenticationToken }
            }
            ch.sendToQueue(queueName, buffer, options)

            if (logMessage) {
              log.info('[AMQP] Send', queueName, message)
            } else {
              const length = message.length
              log.info('[AMQP] Send', queueName, length)
            }
            return ch.close()
          })
        }).finally(() => { conn.close() })
    }).catch(log.warning)
}
