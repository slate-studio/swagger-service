'use strict'

const _ = require('lodash')

module.exports = authenticationToken => {
  if (!authenticationToken) {
    return {}
  }

  const json   = new Buffer(authenticationToken, 'base64').toString()
  const object = JSON.parse(json)

  const namespace = { authenticationToken }

  _.extend(namespace, object)

  return namespace
}
