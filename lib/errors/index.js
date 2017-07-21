'use strict'

const errors = [
  'base',
  'http',
  'documentNotFound',
  'userSessionNotFound',
]

errors.forEach(name => {
  module.exports[_.upperFirst(name)] = require(`./${name}`)
})