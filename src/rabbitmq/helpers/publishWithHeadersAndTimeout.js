'use strict'

const publish          = require('./publish').publish
const RequestNamespace = require('../../utils/requestNamespace')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (topicName, key, object, headers, timeout=0) => {
  const requestNamespace    = new RequestNamespace(headers)
  const authenticationToken = requestNamespace.get('authenticationToken')

  publish(topicName, key, object, authenticationToken)

  return new Promise(resolve => setTimeout(resolve, timeout))
}
