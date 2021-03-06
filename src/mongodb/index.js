'use strict'

const helpers = require('./helpers')
const uri     = _.get(C, 'mongodb.uri')

if (uri) {
  global.Model     = helpers.Model
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

  Model.initializeSchemas()
}

exports = module.exports = helpers.connect

exports.insert = helpers.insert
exports.seed   = helpers.seed
exports.drop   = helpers.drop
