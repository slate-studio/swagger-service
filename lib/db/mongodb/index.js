'use strict'

global.mongoose  = require('mongoose')
mongoose.Promise = global.Promise

const plugins = require('./plugins')
mongoose.plugin(plugins.simulateUnhandledError)
mongoose.plugin(plugins.neverDelete)
mongoose.plugin(plugins.timestamp)
mongoose.plugin(plugins.userstamp, { requestNamespaceKey: 'userId' })
mongoose.plugin(plugins.export)

const schemas = require('./schema')
require('./model')(schemas)

exports = module.exports = require('./connect')

exports.seed   = require('./seed')
exports.drop   = require('./drop')
