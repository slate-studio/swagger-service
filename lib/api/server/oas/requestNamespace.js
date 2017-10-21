'use strict'

const _ = require('lodash')

const debug = require('debug')('swagger:requestNamespace')
const RequestNamespace = require('../../../requestNamespace')

const getNamespace = (authenticationToken) => {
  if (!authenticationToken) {
    return {}
  }

  const json   = new Buffer(authenticationToken, 'base64').toString()
  const object = JSON.parse(json)

  const namespace = { authenticationToken }

  _.extend(namespace, object)

  return namespace
}

const createRequestNamespace = (req, res, next) => {
  const { headers }  = req
  const requestId    = _.get(headers, 'x-request-id')
  const token        = _.get(headers, 'x-authentication-token')
  const namespace    = { requestId }

  _.extend(namespace, getNamespace(token))

  req.requestNamespace = new RequestNamespace(namespace)
  req.requestNamespace.save([ req, res ], next)
}

module.exports = function create(fittingDef) {
  debug('config: %j', fittingDef)

  return function requestNamespace(context, cb) {
    debug('exec')
    createRequestNamespace(context.request, context.response, cb)
  }
}
