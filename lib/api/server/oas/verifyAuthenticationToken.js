'use strict'

const crypto = require('crypto')

module.exports = (authenticationToken, publicKey) => {
  const json   = new Buffer(authenticationToken, 'base64').toString()
  const object = JSON.parse(json)
  const { signature } = object

  delete object.signature

  const jsonObjectWithoutSignature = JSON.stringify(object)

  return crypto
    .createVerify('RSA-SHA256')
    .update(jsonObjectWithoutSignature)
    .verify(publicKey, signature, 'base64')
}
