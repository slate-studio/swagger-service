'use strict'

const mongodb = require('./')
const insert  = require('./insert')

module.exports = hash => {
  return mongodb()
    .then(connection => {
      log.info('Seed:', _.keys(hash))

      const inserts = _.map(hash, (data, name) => insert(name, data))

      return Promise.all(inserts)
        .then(() => {
          return new Promise(resolve => {
            setTimeout(() => connection.close().then(resolve), 2000)
          })
        })
        .catch(error => log.error('Seed error:', error))
    })
}
