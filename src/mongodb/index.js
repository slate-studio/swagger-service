'use strict'

const uri = _.get(C, 'mongodb.uri')

if (uri) {
  global.Model     = require('./model')
  global.mongoose  = require('mongoose')
  mongoose.Promise = Promise

  const timestamp = require('mongoose-timestamp')
  const plugins   = require('./plugins')

  mongoose.plugin(plugins.simulateUnhandledError)
  mongoose.plugin(plugins.userstamp)
  mongoose.plugin(plugins.destroyAll)
  mongoose.plugin(timestamp)
  mongoose.autoIncrement = plugins.autoIncrement
  mongoose.neverDestroy  = plugins.neverDestroy
  mongoose.export        = plugins.export

  Model.initializeSchemas()
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
