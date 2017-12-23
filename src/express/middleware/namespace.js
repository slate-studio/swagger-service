'use strict'

const RequestNamespace    = require('../../../feature/lib/requestNamespace')
const getRequestNamespace = require('../../../feature/lib/getRequestNamespace')

module.exports = (req, res, next) => {
  const { headers } = req

  const requestId           = _.get(headers, 'x-request-id')
  const authenticationToken = _.get(headers, 'x-authentication-token')
  const namespace           = { requestId }

  _.extend(namespace, getRequestNamespace(authenticationToken))

  if (requestId) {
    res.setHeader('x-request-id', requestId)
  }

  req.requestNamespace = new RequestNamespace(namespace)
  req.requestNamespace.save([ req, res ], next)
}
