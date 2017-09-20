'use strict'

const amqp = require('amqplib/callback_api')

const RECONNECT_MILLISECONDS = 1000
let _callback = null

const connect = (callback) => {
  const uri = C.rabbitmq.uri

  _callback = _callback || callback

  amqp.connect(uri, (err, conn) => {
    if (err) {
      log.error('[AMQP]', err.message)
      return setTimeout(connect, RECONNECT_MILLISECONDS)
    }

    log.info('[AMQP] Connected')

    conn.on('error', (err) => {
      if (err.message !== 'Connection closing')
        log.error('[AMQP]', err.message)
    })

    conn.on('close', () => {
      log.error('[AMQP] Reconnecting')
      return setTimeout(connect, RECONNECT_MILLISECONDS)
    })

    conn.createChannel((err, ch) => {
      if (err) {
        log.error('[AMQP]', err.message)
        return conn.close()
      }

      log.info('[AMQP] Channel created')

      ch.on('error', (err) => {
        log.error('[AMQP]', err.message)
      })

      ch.on('close', () => {
        log.info('[AMQP] Channel closed')
      })

      _callback(ch, conn)
    })
  })
}

module.exports = connect
