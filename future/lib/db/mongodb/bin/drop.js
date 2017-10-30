#!/usr/bin/env node

'use strict'

const Cleaner = require('database-cleaner')
const client  = require('mongodb')
const logger  = require('../../../log')
const config  = require('config')

const drop = uri => {
  const cleaner = new Cleaner('mongodb', { mongodb: { skipCollections: [] } })

  return new Promise(resolve => {
    client.connect(uri, (err, db) => {
      log.warn('[mongodb] Drop database:', uri)

      cleaner.clean(db, () => db.close(resolve))
    })
  })
}

module.exports = logger(config)
  .then(() => drop(config.mongodb.uri))
