'use strict'

module.exports = (ch, conn, queue, callback) => {
  ch.assertQueue(queue, { durable: false }, (err) => {
    if (!err) {
      return ch.consume(queue, msg => {
        const utils = require('../../utils')

        const authenticationToken 
          = _.get(msg, 'properties.headers.authenticationToken', null)

        if (authenticationToken) {
          const authData = JSON.parse(
            utils.base64.decode(authenticationToken)
          )
          _.assign(msg.properties.headers, authData)
        }

        callback(msg)
      })
    }

    log.error('[AMQP]', err)
    conn.close()
  })
}
