'use strict'

module.exports = (mongoose, connection) => {
  const debug = C.mongodb.debug
  mongoose.set('debug', debug)

  // 0 - No logging;
  // 1 - Log queries without indexes;
  // 2 - Log all queries;
  let indexProfilingLevel = C.mongodb.indexProfilingLevel || '1'
  indexProfilingLevel = parseInt(indexProfilingLevel)

  if (indexProfilingLevel > 0) {
    mongoose.set('debug', (coll, method, query, options) => {

      const queryMethods = [
        'find',
        'findOne',
        'findAndUpdate',
        'findAndModify',
        'count',
        'update'
      ]

      if (coll !== 'identitycounters' && _.indexOf(queryMethods, method) !== -1) {

        const collection = connection.db.collection(coll)

        collection.find(query).explain((err, explaination) => {
          const indexPath = 'queryPlanner.winningPlan.inputStage.indexName'
          const useIndex  = _.get(explaination, indexPath, null)

          const jsonQuery   = JSON.stringify(query)
          const jsonOptions = JSON.stringify(options)

          if (useIndex === null) {
            const msg = `NO INDEX for ${coll}.${method} QUERY: ${jsonQuery} \
OPTIONS: ${jsonOptions}`
            log.warn(msg)
          }

          if (useIndex !== null && indexProfilingLevel === 2) {
            const msg = `${coll}.${method} QUERY: ${jsonQuery} OPTIONS: \
${jsonOptions} INDEX: ${useIndex}`

            log.info(msg)
          }

        })
      }
    })
  }
}
