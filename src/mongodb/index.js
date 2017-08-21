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
  mongoose.export        = plugins.export
  mongoose.callbacks     = helpers.callbacks

  global.Model = helpers.models()
}

exports = module.exports = helpers.connect

exports.insert = helpers.insert
exports.seed   = helpers.seed
exports.drop   = helpers.drop
