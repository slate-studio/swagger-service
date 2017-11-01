'use strict'

const lib     = require('./')
const qname   = 'scheduleAlgorithmPayloads'
const config  = {
  log: {
    level: 'debug'
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
}

module.exports = lib.log(config)
  .then(() => lib.db.redis(config))
  .then(client => {
    const message = {
      object: 'test',
      headers: {
        'x-authentication-token': 'demo'
      }
    }

    const json = JSON.stringify(message)

    client.rpushAsync(qname, json)
      .then(() => log.debug('success'))
      .then(() => process.exit(0))
  })
