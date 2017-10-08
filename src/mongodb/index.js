'use strict'

const uri = _.get(C, 'mongodb.uri')

if (uri) {
  global.mongoose = require('mongoose')
  mongoose.Promise = Promise

  const plugins = require('./plugins')
  mongoose.plugin(plugins.simulateUnhandledError)
  mongoose.plugin(plugins.neverDestroy)
  mongoose.plugin(plugins.userstamp)
  mongoose.plugin(plugins.destroyAll)
  mongoose.plugin(plugins.timestamp)

  // TODO: Update
  // mongoose.export = plugins.export

  const schemas = require('./schema')
  require('./model')(schemas)
}

exports = module.exports = () => {
  // TODO: Need to update a connection fail strategy with Mongodb and put a link
  //       with description here:
  //   autoReconnect:    false,
  //   bufferMaxEntries: 0
  // }

  // const uri = C.mongodb.uri + '?autoReconnect=false'

  if (uri) {
    const debug   = require('./debug')
    const options = {
      useMongoClient: true,
      keepAlive:      1
    }

    return mongoose.connect(uri, options)
      .then(connection => {
        log.info('Mongodb connected:', uri)

        debug(mongoose, connection)

        return connection
      })
  }
}

exports.insert = require('./insert')
exports.seed   = require('./seed')
exports.drop   = require('./drop')
