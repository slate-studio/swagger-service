#!/usr/bin/env node

'use strict'

const logger = require('../../../log')
const config = require('config')
const redis  = require('../')

module.exports = logger(config)
  .then(() => redis(config.redis))
  .then(client => {
    log.warn('[redis] Drop database:', config.redis)
    return client.flushallAsync()
      .then(() => client.quit())
  })
