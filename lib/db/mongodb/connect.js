'use strict'

const logger  = require('../../log')

// TODO: Need to update a connection fail strategy with Mongodb and put a link
//       with description here:
//   autoReconnect:    false,
//   bufferMaxEntries: 0
// }

// const uri = C.mongodb.uri + '?autoReconnect=false'

const connect = () => {
  const uri = _.get(C, 'mongodb.uri')

  const options = {
    useMongoClient: true,
    keepAlive:      1
  }

  return mongoose.connect(uri, options)
    .then(connection => {
      const IGNORE_METHODS = [
        'createIndex', 'drop'
      ]

      mongoose.set('debug', (collection, method, query, options) => {
        connection.db.collection(collection)
          .find(query).explain((err, explaination) => {
            const path  = 'queryPlanner.winningPlan.inputStage.indexName'
            const index = _.get(explaination, path, null)

            if (!_.includes(IGNORE_METHODS, method)) {
              if (_.isEmpty(query)) {
                const msg = '[mongodb]: Query is empty, potentially slow operation\n'
                log.warn(msg, { collection, method, query, options, index })
                return
              }

              if (index === null) {
                const msg = '[mongodb]: Query has no index\n'
                log.warn(msg, { collection, method, query, options })
                return
              }
            }

            log.info('[mongodb]:\n', { collection, method, query, options, index })
          })
      })

      log.info('[mongodb] Connected:', uri)
      return connection
    })
}

exports = module.exports = () => logger().then(connect)
