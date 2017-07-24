'use strict'

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

      const possibleMethods = [ 'find',
                                'findOne',
                                'findAndUpdate',
                                'findAndModify',
                                'count',
                                'update' ]

      if (_.indexOf(possibleMethods, method) !== -1) {

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
  const mongoose      = require('mongoose')
  const plugins       = require('./plugins')
  const autoIncrement = require('mongoose-auto-increment')

  // NOTE: Use custom `cls-bluebird`-ed promises to support chained logs.
  mongoose.Promise = Promise

  const connection = mongoose.connect(uri).connection

  mongoose.plugin(plugins.simulateUnhandledError)

  autoIncrement.initialize(connection)
  global.Models = require(`${_rootPath}/src/models`)

  debugQueryIndex(mongoose, connection)

  connection.on('open', () => {
    log.info('Mongodb connected')
    callback(connection)
  })
}
