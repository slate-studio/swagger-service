'use strict'

const encode = str => {
  return new Buffer(str).toString('base64')
}

const decode = base64Str => {
  return new Buffer(base64Str, 'base64').toString()
}

module.exports = {
  encode,
  decode
}