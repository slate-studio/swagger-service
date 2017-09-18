'use strict'

const base64 = require('../../utils/base64')

module.exports = (channel, connection, queue, callback) => {
  ch.assertQueue(queue, { durable: false }, error => {
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

      // TODO: Add CSL here.
      // const authData = JSON.parse(
      //   base64.decode(authenticationToken)
      // )
      // _.assign(msg.properties.headers, authData)
      const headers = { 'x-authentication-token': authenticationToken }

      msg.requestNamespace = new RequestNamespace(headers)
      msg.requestNamespace.save()
        .then(() => callback(msg))
    })
  })
}
