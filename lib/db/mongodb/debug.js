  // // 0 - No logging;
  // // 1 - Log queries without indexes;
  // // 2 - Log all queries;
  // let indexProfilingLevel = C.mongodb.indexProfilingLevel || '1'
  // indexProfilingLevel = parseInt(indexProfilingLevel)

  // if (indexProfilingLevel > 0) {

'use strict'

module.exports = (mongoose, connection) => {
  const debug = _.get(C, 'mongodb.debug', 'index')
  const LEVEL = { 'off': 0, 'index': 1, 'all': 2 }

  const debugLevel = LEVEL[debug] || 0

  if (debugLevel == 0) {
    return mongoose.set('debug', debugLevel)
  }

  return mongoose.set('debug', (coll, method, query, options) => {
    const DEBUG_METHODS = [
      'find',
      'findOne',
      'findAndUpdate',
      'findAndModify',
      'count',
      'update'
    ]

    const IGNORE_COLLECTIONS = [
      'identitycounters'
    ]

    if (!_.includes(DEBUG_METHODS, method)) {
      return
    }

    if (!_.includes(IGNORE_COLLECTIONS, coll)) {
      return
    }

    const collection = connection.db.collection(coll)

    collection.find(query).explain((err, explaination) => {
      const indexPath = 'queryPlanner.winningPlan.inputStage.indexName'
      const useIndex  = _.get(explaination, indexPath, null)

      const jsonQuery   = JSON.stringify(query)
      const jsonOptions = JSON.stringify(options)

      if (debugLevel === 2) {
        const msg = `${coll}.${method} QUERY: ${jsonQuery} OPTIONS: \
  ${jsonOptions} INDEX: ${useIndex}`

        log.debug(msg)
      }

      if (useIndex === null) {
        const msg = `NO INDEX for ${coll}.${method} QUERY: ${jsonQuery} \
  OPTIONS: ${jsonOptions}`
        log.warn(msg)
      }
    })
  })
}
