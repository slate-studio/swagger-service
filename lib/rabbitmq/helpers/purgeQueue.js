'use strict'

const uri  = C.rabbitmq.uri
const amqp = require('amqplib')

module.exports = (queueName) => {
  amqp.connect(uri)
    .then((conn) => {
      return conn.createChannel()
        .then((ch) => {
          const ok = ch.assertQueue(queueName, { durable: false })

          return ok.then(() => {
            return ch.purgeQueue(queueName)
              .then(() => {
                return ch.close()
              })

          })
        }).finally(() => { conn.close() })
    }).catch()
}
