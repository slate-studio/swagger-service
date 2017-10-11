'use strict'

module.exports = namespace => {
  const json  = JSON.stringify(namespace)
  const token = new Buffer(json).toString('base64')

  return token
}
