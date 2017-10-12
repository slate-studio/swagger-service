'use strict'

global.mongoose = require('mongoose')
mongoose.Promise = Promise

const plugins = require('./plugins')
mongoose.plugin(plugins.simulateUnhandledError)
mongoose.plugin(plugins.timestamp)
mongoose.plugin(plugins.userstamp, { requestNamespaceKey: 'userId' })
mongoose.plugin(plugins.neverDelete)

// TODO: Update
// mongoose.export = plugins.export

const schemas = require('./schema')
require('./model')(schemas)

exports = module.exports = require('./connect')

exports.insert = require('./insert')
exports.seed   = require('./seed')
exports.drop   = require('./drop')
