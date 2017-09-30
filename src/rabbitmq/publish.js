'use strict'

const amqp = require('amqplib')

// TODO: When no connection this fails and doesn't retry to publish the message.
module.exports = ({ uri, topic, key, object, headers }) => {
  let connection
  let channel

  return amqp.connect(uri)
    .then(conn => {
      connection = conn
      return connection.createChannel()
    })
    .then(ch => {
      channel = ch
      return channel.assertExchange(topic, 'topic', { durable: false })
    })
    .then(() => {
      const json    = JSON.stringify(object)
      const buffer  = new Buffer(json)
      const options = { headers }

      log.info('Rabbitmq publish', `${topic}.${key}`, object)
      return channel.publish(topic, key, buffer, options)
    })
    .then(() => channel.close())
    .finally(() => connection.close())
    .catch(log.error)
}
