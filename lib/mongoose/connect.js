'use strict'

const uri   = C.mongodb.uri
const debug = C.mongodb.debug

module.exports = (callback) => {
  const mongoose      = require('mongoose')
  const autoIncrement = require('mongoose-auto-increment')

  mongoose.Promise = Promise
  mongoose.set('debug', debug)

  // NOTE: Here we can implement custom loggin with bunian.
  // mongoose.set('debug', (coll, method, query, doc [, options]) => {
  // })

  const connection = mongoose.connect(uri).connection

  autoIncrement.initialize(connection)
  global.Models = require(`${_rootPath}/src/models`)

  connection.on('open', () => {
    log.info('Mongodb connected')
    callback(connection)
  })
}
