'use strict'

const amqp = require('amqplib')

const purge = (queue) => {
  const uri = C.rabbitmq.uri

  let channel
  let connection

  amqp.connect(uri)
    .then(conn => {
      connection = conn
      return conn.createChannel()
    })
    .then(ch => {
      channel = ch
      return ch.assertQueue(queue, { durable: false })
    })
    .then(() => channel.purgeQueue(queue))
    .then(() => channel.close())
    .finally(() => connection.close())
    .catch(err => log.error('Rabbitmq purge error:', err.message))
}

module.exports = purge
