'use strict'

module.exports = () => {
  // TODO: Need to update a connection fail strategy with Mongodb and put a link
  //       with description here:
  //   autoReconnect:    false,
  //   bufferMaxEntries: 0
  // }

  // const uri = C.mongodb.uri + '?autoReconnect=false'
  const uri = _.get(C, 'mongodb.uri')

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
