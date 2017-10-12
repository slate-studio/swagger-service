'use strict'

module.exports = (req, spec, authenticationToken, callback) => {
  // TODO: Add authentication when requirements are defined.
  if (authenticationToken) {
    return callback()
  }

  const error = new errors.Http.Http403()
  error.errors = []
  error.errors.push(new Error('Bad!'))//errors.AuthenticationTokenNotProvided())

  return callback(error)
}
