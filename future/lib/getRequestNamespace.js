'use strict'

const _ = require('lodash')

module.exports = token => {
   if (!token) {
    return {}
  }

  let payload

  try {
    const payloadBase64 = token.split('.')[1]
    const json = new Buffer(payloadBase64, 'base64').toString()
    payload = JSON.parse(json)

  } catch (error) {
    log.warn('Authentication token error:',  error)
    throw new Error('Invalid authentication token')

  }

  const namespace = { authenticationToken: token }

  _.extend(namespace, payload)

  return namespace
}
