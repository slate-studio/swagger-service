'use strict'

const cls = require('continuation-local-storage')

module.exports = (req, res, next) => {
  const requestId = req.headers['x-request-id']
  const userId    = req.headers['x-user-id']
  const namespace = cls.getNamespace('requestNamespace')

  namespace.bindEmitter(req)
  namespace.bindEmitter(res)

  namespace.run(() => {
    namespace.set('requestId', requestId)
    namespace.set('userId', userId)
    next()
  })
}
