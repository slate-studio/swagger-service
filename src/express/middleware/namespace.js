'use strict'

const cls = require('continuation-local-storage')

module.exports = (req, res, next) => {
  const requestId  = req.headers['x-request-id']
  const userId     = req.headers['x-user-id']
  const idnId      = req.headers['x-idn-id']      || null
  const facilityId = req.headers['x-facility-id'] || null

  const namespace = cls.getNamespace('requestNamespace')

  namespace.bindEmitter(req)
  namespace.bindEmitter(res)

  namespace.run(() => {
    namespace.set('requestId',  requestId)
    namespace.set('userId',     userId)
    namespace.set('idnId',      idnId)
    namespace.set('facilityId', facilityId)

    next()
  })
}
