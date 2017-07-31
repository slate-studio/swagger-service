'use strict'

const uri  = C.rabbitmq.uri
const amqp = require('amqplib')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (queueName, message, silent) => {
  amqp.connect(uri)
    .then((conn) => {
      return conn.createChannel()
        .then((ch) => {
          const ok = ch.assertQueue(queueName, { durable: false })

          return ok.then(() => {
            const buffer = new Buffer(message)
            ch.sendToQueue(queueName, buffer)

            if (!silent) {
              log.info('[AMQP] Send', queueName, message)
            }
            return ch.close()
          })
        }).finally(() => { conn.close() })
    }).catch(log.warning)
}
