'use strict'

const send             = require('./send').send
const RequestNamespace = require('../../utils/requestNamespace')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (queueName, object, headers, timeout=0) => {
  const requestNamespace    = new RequestNamespace(headers)
  const authenticationToken = requestNamespace.get('authenticationToken')

  send(queueName, object, authenticationToken)

  return new Promise(resolve => setTimeout(resolve, timeout))
}
