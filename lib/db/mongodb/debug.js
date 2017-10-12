'use strict'

module.exports = (mongoose, connection) => {
  const debug = _.get(C, 'mongodb.debug', 'index')
  const LEVEL = { 'off': 0, 'index': 1, 'all': 2 }

  const debugLevel = LEVEL[debug] || 0

  if (debugLevel == 0) {
    return mongoose.set('debug', debugLevel)
  }

  const IGNORE_METHODS = [
    'createIndex'
  ]

  const IGNORE_COLLECTIONS = [
    // 'identitycounters'
  ]

  return mongoose.set('debug', (collection, method, query, options) => {
    if (_.includes(IGNORE_COLLECTIONS, collection)) {
      return
    }

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

        if (debugLevel === 2) {
          log.debug('[mongodb]:\n', { collection, method, query, options, index })
        }
      })
  })
}
