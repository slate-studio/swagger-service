'use strict'

const errors = [
  'base',
  'http',
  'documentNotFound',
  'userSessionNotFound',
  'authenticationTokenNotProvided',
  'unauthorizedOperationError',
]

errors.forEach(name => {
  module.exports[_.upperFirst(name)] = require(`./${name}`)
})
