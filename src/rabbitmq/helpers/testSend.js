'use strict'

const send                    = require('./send').send
const requestNamespaceUtility = require('../../utils/requestNamespace')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (queueName, object, headers) => {
  const requestNamespace    = requestNamespaceUtility.getRequestNamespace(headers)
  const authenticationToken = requestNamespace.get('authenticationToken')

  return send(queueName, object, authenticationToken)
}
