'use strict'

const amqp = require('amqplib/callback_api')

const connect = (config, timeout) => {
  const uri = config.uri

  return new Promise((resolve, reject) => {
    amqp.connect(uri, (err, connection) => {
      if (err) {
        log.error('[msg] Error:', err.message)
        return setTimeout(connect, timeout)
      }

      connection.on('error', err => {
        if (err.message !== 'Connection closing') {
          log.error('[msg] Error:', err.message)
        }
      })

      connection.on('close', () => {
        log.error('[msg] Reconnecting')
        return setTimeout(connect, timeout)
      })

      connection.createChannel((err, channel) => {
        if (err) {
          log.error('[msg] Error:', err.message)
          return connection.close()
            .then(() => reject(err))
        }

        channel.on('error', (err) => log.error('[msg] Error:', err.message))

        channel.on('close', () => log.info('[msg] Channel closed'))

        log.info('[msg] Channel created')

        return resolve({ channel, connection })
      })

      log.info('[msg] Connected:', uri)
    })
  })
}

module.exports = connect
