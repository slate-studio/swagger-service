#!/usr/bin/env node

'use strict'

const logger  = require('../../../log')
const config  = require('config')
const redis   = require('../')

const drop = uri => {
  const cleaner = new Cleaner('mongodb', { mongodb: { skipCollections: [] } })

  return new Promise(resolve => {
    client.connect(uri, (err, db) => {
      if (log) {
      }

      cleaner.clean(db, () => db.close(resolve))
    })
  })
}

module.exports = logger(config)
  .then(() => redis(config.redis))
  .then(client => {
    log.warn('[redis] Drop database:', config.redis)
    return client.flushallAsync()
  })
