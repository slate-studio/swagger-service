'use strict'

const uri   = C.rabbitmq.uri
const amqp  = require('amqplib')
const cls   = require('continuation-local-storage')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (topicName, key, message, options = {}) => {
  let namespace = {}

  if (_.isEmpty(options)) {
    namespace = cls.getNamespace('requestNamespace')
  } else {
    const utils = require('../../utils')
    namespace   = new utils.CustomRequestNamespace(options)
  }
  const authenticationToken = namespace.get('authenticationToken')

  amqp.connect(uri)
    .then((conn) => {
      return conn.createChannel()
        .then((ch) => {
          const ok = ch.assertExchange(topicName, 'topic', { durable: false })
          return ok.then(() => {
            log.info('[AMQP] Publish', `${topicName}.${key}`, message)

            const json   = JSON.stringify(message)
            const buffer = new Buffer(json)
            const options = {
              headers: { authenticationToken }
            }
            ch.publish(topicName, key, buffer, options)

            return ch.close()
          })

        }).finally(() => { conn.close() })
    }).catch(log.warning)
}
