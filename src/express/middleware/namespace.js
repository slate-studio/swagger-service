'use strict'

const RequestNamespace = require('../../utils/requestNamespace')

module.exports = (req, res, next) => {
  req.requestNamespace = new RequestNamespace(req.headers)

  req.requestNamespace.save([ req, res ], () => {
    req.requestNamespace.set('requestId', req.headers['x-request-id'])
    next()
  })
}
