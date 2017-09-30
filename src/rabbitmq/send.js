'use strict'

const amqp = require('amqplib')

// TODO: When no connection this fails and doesn't retry to send the message.
module.exports = ({ uri, queue, object, headers }) => {
  let connection
  let channel

  return amqp.connect(uri)
    .then(conn => {
      connection = conn
      return connection.createChannel()
    })
    .then(ch => {
      channel = ch
      return channel.assertQueue(queue, { durable: false })
    })
    .then(() => {
      const json    = JSON.stringify(object)
      const buffer  = new Buffer(json)
      const options = { headers }

      log.info('Rabbitmq send', queue, object)
      return channel.sendToQueue(queue, buffer, options)
    })
    .then(() => channel.close())
    .finally(() => connection.close())
    .catch(log.error)

}
