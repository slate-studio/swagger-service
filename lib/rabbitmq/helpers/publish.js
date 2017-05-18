'use strict'

const uri  = C.rabbitmq.uri
const amqp = require('amqplib')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (topicName, key, message) => {
  amqp.connect(uri)
    .then((conn) => {
      return conn.createChannel()
        .then((ch) => {
          const ok = ch.assertExchange(topicName, 'topic', { durable: false })
          return ok.then(() => {
            const json   = JSON.stringify(message)
            const buffer = new Buffer(json)
            ch.publish(topicName, key, buffer)

            log.info('[AMQP] Publish', `${topicName}.${key}`, message)

            return ch.close()
          })

        }).finally(() => { conn.close() })
    }).catch(log.warning)
}
