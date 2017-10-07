'use strict'

module.exports = () => {
  return new Promise((resolve, reject) => {
    const uri = _.get(C, 'mongodb.uri')

    if (!uri) {
      const error = new Error('Mongodb URI is missing')
      log.fatal(error)
      reject(error)
    }

    const Cleaner = require('database-cleaner')
    const mongodb = require('mongodb')

    const params = {
      mongodb: {
        skipCollections: []
      }
    }

    const cleaner = new Cleaner('mongodb', params)

    mongodb.connect(uri, (err, db) => {
      log.info('Drop database:', uri)

      cleaner.clean(db, () => db.close(resolve))
    })
  })
}
