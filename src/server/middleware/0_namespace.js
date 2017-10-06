'use strict'

const base64 = require('../../utils/base64')
const RequestNamespace = require('../../utils/requestNamespace')

const getNamespace = authenticationToken => {
  const json   = base64.decode(authenticationToken)
  const object = JSON.parse(json)
  const namespace = _.extend({ authenticationToken }, object)

  return namespace
}

module.exports = (req, res, next) => {
  const { headers } = req
  const token       = _.get(headers, 'x-authentication-token')
  const namespace   = getNamespace(token)

  req.requestNamespace = new RequestNamespace(namespace)
  req.requestNamespace.save([ req, res ], next)
}
