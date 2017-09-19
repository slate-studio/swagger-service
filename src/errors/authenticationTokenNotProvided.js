'use strict'

const Base = require('./base')

class AuthenticationTokenNotProvided extends Base {
  constructor(message) {
    super('X-Authentication-Token header is not provided.')
    this.code = 'AUTHENTICATION_TOKEN_NOT_PROVIDED'
    this.name = this.constructor.name
  }
}

module.exports = AuthenticationTokenNotProvided
