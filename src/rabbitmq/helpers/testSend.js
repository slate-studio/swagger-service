'use strict'

const send             = require('./send').send
const RequestNamespace = require('../../utils/requestNamespace')

// TODO: When no connection this fails and doesn't retry sending the message.
module.exports = (queueName, object, headers, timeout) => {
  const requestNamespace    = new RequestNamespace(headers)
  const authenticationToken = requestNamespace.get('authenticationToken')

  const result = send(queueName, object, authenticationToken)

  if (_.isNumber(timeout)) {
    return new Promise(resolve => {
      return setTimeout(resolve, parseInt(timeout))
    })
  }

  return result
}
