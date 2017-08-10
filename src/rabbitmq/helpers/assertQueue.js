'use strict'

module.exports = (ch, conn, queue, callback) => {
  ch.assertQueue(queue, { durable: false }, (err) => {
    if (!err) {
      return ch.consume(queue, callback)
    }

    log.error('[AMQP]', err)
    conn.close()
  })
}
