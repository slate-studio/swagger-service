#!/usr/bin/env node

require('../')

const Cleaner = require('database-cleaner')
const mongodb = require('mongodb')

const uri    = C.mongodb.uri
const params = {
  mongodb: {
    skipCollections: []
  }
}

const cleaner = new Cleaner('mongodb', params)

mongodb.connect(uri, (err, db) => {
  log.info('Drop database:', uri)

  cleaner.clean(db, () => db.close())
})
