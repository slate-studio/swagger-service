'use strict'

const RequestNamespace = require('../../utils/requestNamespace')

module.exports = (channel, connection, queue, callback) => {
  channel.assertQueue(queue, { durable: false }, error => {
    if (error) {
      log.error('[AMQP]', error)
      return connection.close()
    }

    return channel.consume(queue, msg => {

      const authenticationToken = _
        .get(msg, 'properties.headers.authenticationToken', null)

      if (!authenticationToken) {
        log.error('[AMQP] authenticationToken header is not defined.')
        // TODO: Close invalid queue message to do not re-read it again.
        return channel.ack(msg)
      }

      const headers = { 'x-authentication-token': authenticationToken }

      msg.requestNamespace = new RequestNamespace(headers)
      msg.requestNamespace.save({}, () => callback(msg))
    })
  })
}
