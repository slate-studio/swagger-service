'use strict'

const uri = C.mongodb.uri

module.exports = (callback) => {
  const DatabaseCleaner = require('database-cleaner')
  const mongodb = require('mongodb')
  const databaseCleaner = new DatabaseCleaner('mongodb', {
    mongodb: {
      skipCollections: []
    }
  })

  mongodb.connect(uri, (err, db) => {
    databaseCleaner.clean(db, () => {
      log.info('=> [Database::Drop]', uri)
      db.close(callback)
    })
  })
}
