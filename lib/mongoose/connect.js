'use strict'

const uri   = C.mongodb.uri
const debug = C.mongodb.debug

// 0 - Do not profiling;
// 1 - Profiling queries doesn't use indexes;
// 2 - Profiling all queries
const indexProfilingLevel = parseInt(C.mongodb.indexProfilingLevel)

const setDebug = (mongoose, connection) => {
  mongoose.set('debug', debug)

  if (indexProfilingLevel > 0) {
    mongoose.set('debug', (coll, method, query, options) => {

      const possibleMethods = ['find', 'findOne', 'findAndUpdate', 'findAndModify', 'count', 'update']

      if (_.indexOf(possibleMethods, method) !== -1) {

        const collection = connection.db.collection(coll)

        collection.find(query).explain((err, explaination) => {
          const useIndex = _.get(explaination, 'queryPlanner.winningPlan.inputStage.indexName', null)

          if (useIndex === null) {
            log.warn(`Query: '${JSON.stringify(query)}' in '${method}' method for '${coll}' collection does not use any indexes! \nOptions: '${JSON.stringify(options)}'`)
          }

          if (useIndex !== null && indexProfilingLevel === 2) {
            log.info(`Query: '${JSON.stringify(query)}' in '${method}' method for '${coll}' collection use '${useIndex}' index. \nOptions: '${JSON.stringify(options)}'`)
          }

        })
      }
    })
  }
}

module.exports = callback => {
  const mongoose      = require('mongoose')
  const autoIncrement = require('mongoose-auto-increment')

  // NOTE: Use custom `cls-bluebird`-ed promises to support chained logs.
  mongoose.Promise = Promise 

  mongoose.connect(uri, { useMongoClient: true })
    .then(connection => {
      setDebug(mongoose, connection)
    
      autoIncrement.initialize(connection)
      global.Models = require(`${_rootPath}/src/models`)

      log.info('Mongodb connected')
      callback(connection)
    })
}
