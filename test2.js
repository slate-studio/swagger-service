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
    const brpop = () => {
      client.brpopAsync([qname, 'scheduleAlgorithmResults', 1])
        .then(value => {
          if (value) {
            const [ queue, message ] = value
            log.debug('QUEUE', queue)
            log.debug('MSG', message)
          }
          else {
            log.debug('ping')
          }
        })
        .finally(() => brpop())
    }

    brpop()
  })
