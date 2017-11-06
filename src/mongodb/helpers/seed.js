'use strict'

const connect = require('./connect')
const insert  = require('./insert')

const exitTimeout = 1000

module.exports = (hash) => {
  return connect()
    .then((connection) => {
      log.info('Seed:', _.keys(hash))

      const inserts = _.map(hash, (data, name) => insert(name, data))

      return Promise.all(inserts)
        .then(() => {
          return new Promise(resolve => {
            setTimeout(() => connection.close().then(resolve), 2000)
          })
        })
        .catch(error => {
          log.error('Seed error:', error)
          setTimeout(() => process.exit(1), exitTimeout)
        })
    })
}
