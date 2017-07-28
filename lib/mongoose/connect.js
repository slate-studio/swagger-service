'use strict'

const mongoose = require('mongoose')

const uri   = C.mongodb.uri
const debug = C.mongodb.debug

// 0 - Do not profiling;
// 1 - Profiling queries doesn't use indexes;
// 2 - Profiling all queries
const indexProfilingLevel = parseInt(C.mongodb.indexProfilingLevel)

const debugQueryIndex = (mongoose, connection) => {
  mongoose.set('debug', debug)

  if (indexProfilingLevel > 0) {
    mongoose.set('debug', (coll, method, query, options) => {

      const possibleMethods = [
        'find',
        'findOne',
        'findAndUpdate',
        'findAndModify',
        'count',
        'update'
      ]

      if (coll !== 'identitycounters' && _.indexOf(possibleMethods, method) !== -1) {

        const collection = connection.db.collection(coll)

        collection.find(query).explain((err, explaination) => {
          const indexPath = 'queryPlanner.winningPlan.inputStage.indexName'
          const useIndex  = _.get(explaination, indexPath, null)

          const jsonQuery   = JSON.stringify(query)
          const jsonOptions = JSON.stringify(options)

          if (useIndex === null) {
            const msg = `Query: '${jsonQuery}' in '${method}' method for \
              '${coll}' collection does not have an index. \nOptions: \
              '${jsonOptions}'`

            log.debug(msg)
          }

          if (useIndex !== null && indexProfilingLevel === 2) {
            const msg = `Query: '${jsonQuery}' in '${method}' method for \
              '${coll}' collection uses '${useIndex}' index. \nOptions: \
              '${jsonOptions}'`

            log.debug(msg)
          }

        })
      }
    })
  }
}

module.exports = callback => {
  // NOTE: Use custom `cls-bluebird`-ed promises to support chained logs.
  mongoose.Promise = Promise

  const connectOptions = {
    useMongoClient:   true,
    autoReconnect:    false,
    keepAlive:        1,
    bufferMaxEntries: 0
  }

  mongoose.connect(uri + '?autoReconnect=false', connectOptions)
    .then(connection => {
      log.info('Mongodb connected')

      debugQueryIndex(mongoose, connection)

      if (callback) {
        callback(connection)
      }
    })
}
