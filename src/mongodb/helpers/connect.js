'use strict'

module.exports = () => {
  // TODO: Here we should have a support for replicas.
  const uri = C.mongodb.uri
  // const uri = C.mongodb.uri + '?autoReconnect=false'

  const options = {
    useMongoClient: true,
    keepAlive:      1
  }
  // TODO: Need to update a connection fail strategy with Mongodb and put a link
  //       with description here:
  //   autoReconnect:    false,
  //   bufferMaxEntries: 0
  // }

  if (uri) {
    const debug = require('./debug')

    return mongoose.connect(uri, options)
      .then(connection => {
        log.info('Mongodb connected:', uri)

        debug(mongoose, connection)

        return connection
      })
  }
}
