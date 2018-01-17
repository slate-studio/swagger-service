'use strict'

const RequestNamespace    = require('../../../future/lib/requestNamespace')
const getRequestNamespace = require('../../../future/lib/getRequestNamespace')

module.exports = (req, res, next) => {
  const { headers } = req

  const requestId           = _.get(headers, 'x-request-id')
  const authenticationToken = _.get(headers, 'authorization')
  const sourceOperationId   = _.get(headers, 'x-source-operation-id')
  const namespace           = { requestId, sourceOperationId }

  _.extend(namespace, getRequestNamespace(authenticationToken))

  if (requestId) {
    res.setHeader('x-request-id', requestId)
  }

  req.requestNamespace = new RequestNamespace(namespace)
  req.requestNamespace.save([ req, res ], next)
}
