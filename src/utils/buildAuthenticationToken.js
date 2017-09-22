'use strict'

const base64 = require('./base64')

module.exports = namespace => {
  namespace    = JSON.stringify(namespace)
  const token  = base64.encode(namespace)

  return token
}
