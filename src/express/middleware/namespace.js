'use strict'

const RequestNamespace = require('../../utils/requestNamespace')

module.exports = (req, res, next) => {
  req.requestNamespace = new RequestNamespace(req.headers)
  req.requestNamespace.save([ req, res ], next)
}
