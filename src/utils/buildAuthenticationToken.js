'use strict'

module.exports = (namespace) => {
  const buffer = new Buffer(JSON.stringify(namespace))
  const token  = buffer.toString('base64')

  return token
}
