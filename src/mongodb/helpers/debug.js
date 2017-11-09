'use strict'

const RequestNamespace = require('../../../future/lib/requestNamespace')

const IGNORE_METHODS = [
  'createIndex', 'drop'
]

const logExplanation = (explanation, collection, method, query, options) => {
  const path  = 'queryPlanner.winningPlan.inputStage.indexName'
  const index = _.get(explanation, path, null)

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
}

module.exports = (_mongoose, _connection) => {
  _mongoose.set('debug', (collection, method, query, options) => {
    const requestNamespace = new RequestNamespace()
    const namespace        = requestNamespace.getAll()

    _connection.db.collection(collection)
      .find(query).explain((err, explanation) => {
        if (!namespace) {
          return logExplanation(explanation, collection, method, query, options)
        }

        const requestNamespace = new RequestNamespace(namespace)
        requestNamespace.save([ ], () => {
          logExplanation(explanation, collection, method, query, options)
        })
      })
  })
}
