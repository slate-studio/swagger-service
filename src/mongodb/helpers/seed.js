'use strict'

const connect = require('./connect')
const insert  = require('./insert')

module.exports = (hash) => {
  return connect()
    .then((connection) => {
      log.info('Seed:', _.keys(hash))

      const inserts = _.map(hash, (data, name) => insert(name, data))

      return Promise.all(inserts)
        .then(() => connection.close())
        .catch(error => log.error('Seed error:', error))
    })
}
