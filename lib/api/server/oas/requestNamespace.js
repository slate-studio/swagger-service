'use strict'

const debug = require('debug')('swagger:requestNamespace')
const RequestNamespace = require('../../../requestNamespace')

// TODO: This method should be passed to the server as an option.
const getNamespace = authenticationToken => {
  const json      = new Buffer(authenticationToken, 'base64').toString()
  const object    = JSON.parse(json)
  const namespace = _.extend({ authenticationToken }, object)

  return namespace
}

// TODO: This middleware shoudl be merged with swagger_security one.
const createRequestNamespace = (req, res, next) => {
  const { headers } = req
  const requestId   = _.get(headers, 'x-request-id')
  const token       = _.get(headers, 'x-authentication-token')

  // TODO: Add token and requestId to the namespace.
  const namespace = { requestId }

  if (token) {
    _.extend(namespace, getNamespace(token))
  }

  req.requestNamespace = new RequestNamespace(namespace)
  req.requestNamespace.save([ req, res ], next)
}

module.exports = function create(fittingDef, bagpipes) {
  debug('config: %j', fittingDef)

  return function requestNamespace(context, cb) {
    debug('exec')
    createRequestNamespace(context.request, context.response, cb)
  }
}
