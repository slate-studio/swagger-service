'use strict'

const errors = require('../../../errors')

module.exports = (req, spec, authenticationToken, callback) => {
  // TODO: Add authentication when requirements are defined.
  if (authenticationToken) {
    return callback()
  }

  const error = new errors.Http.Http403()
  error.errors = []
  error.errors.push(new errors.AuthenticationTokenNotProvided())

  return callback(error)
}
