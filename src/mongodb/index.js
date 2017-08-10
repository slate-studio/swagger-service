'use strict'

const helpers = require('./helpers')

if (C.mongodb.uri) {
  global.mongoose  = require('mongoose')
  mongoose.Promise = Promise

  const timestamp = require('mongoose-timestamp')
  const plugins   = require('./plugins')

  mongoose.plugin(plugins.simulateUnhandledError)
  mongoose.plugin(plugins.userstamp)
  mongoose.plugin(timestamp)
  mongoose.autoIncrement = plugins.autoIncrement
  mongoose.neverDestroy  = plugins.neverDestroy
  mongoose.callbacks     = helpers.callbacks

  global.Models = helpers.models()

  const modelNames = _.keys(Models)
  if (modelNames.length > 0) {
    log.info('Models initialized:', modelNames)
  }
}

exports = module.exports = helpers.connect

exports.insert = helpers.insert
exports.seed   = helpers.seed
