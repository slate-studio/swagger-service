'use strict'

const RequestNamespace = require('../requestNamespace')

const getNamespace = authenticationToken => {
  const json      = new Buffer(authenticationToken, 'base64').toString()
  const object    = JSON.parse(json)
  const namespace = _.extend({ authenticationToken }, object)

  return namespace
}

module.exports = (req, res, next) => {
  const { headers } = req
  const token       = _.get(headers, 'x-authentication-token')

  // TODO: Add token and requestId to the namespace.
  const namespace = getNamespace(token)

  req.requestNamespace = new RequestNamespace(namespace)
  req.requestNamespace.save([ req, res ], next)
}
