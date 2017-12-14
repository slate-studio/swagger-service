'use strict'

const RequestNamespace = require('../../utils/requestNamespace')

module.exports = (req, res, next) => {
  res.setHeader('x-request-id', req.headers['x-request-id'])
  req.requestNamespace = new RequestNamespace(req.headers)
  req.requestNamespace.save([ req, res ], next)
}
