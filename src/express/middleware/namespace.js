'use strict'

const RequestNamespace = require('../../utils/requestNamespace')

module.exports = (req, res, next) => {
  const requestId = req.headers['x-request-id']
  if (requestId) {
    res.setHeader('x-request-id', requestId)
  }

  req.requestNamespace = new RequestNamespace(req.headers)
  req.requestNamespace.save([ req, res ], next)
}
