'use strict'

const publish                 = require('./publish').publish
const requestNamespaceUtility = require('../../utils/requestNamespace')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (topicName, key, object, headers) => {
  const requestNamespace    = requestNamespaceUtility.getRequestNamespace(headers)
  const authenticationToken = requestNamespace.get('authenticationToken')

  return publish(topicName, key, object, authenticationToken)
}
