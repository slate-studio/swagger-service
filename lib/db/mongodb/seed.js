'use strict'

const logger  = require('../../log')
const mongodb = require('./')
// const insert  = require('./insert')

const seed = dataSets => {
  return mongodb()
    .then(connection => {
      log.info('Seed:', _.keys(dataSets))

      const inserts = _.map(dataSets, (data, name) => insert(name, data))

      return Promise.all(inserts)
        .then(() => {
          return new Promise(resolve => {
            setTimeout(() => connection.close().then(resolve), 2000)
          })
        })
        .catch(error => log.error('Seed error:', error))
    })
}

module.exports = dataSets => logger().then(() => seed(dataSets))
