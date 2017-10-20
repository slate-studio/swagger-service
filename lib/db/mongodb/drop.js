'use strict'

const Cleaner = require('database-cleaner')
const client  = require('mongodb')
const logger  = require('../../log')

const drop = uri => {
  const cleaner = new Cleaner('mongodb', { mongodb: { skipCollections: [] } })

  return new Promise(resolve => {
    client.connect(uri, (err, db) => {
      if (log) {
        log.warn('[mongodb] Drop database:', uri)
      }

      cleaner.clean(db, () => db.close(resolve))
    })
  })
}

module.exports = config => {
  return logger(config)
    .then(() => drop(config.mongodb.uri))
}
