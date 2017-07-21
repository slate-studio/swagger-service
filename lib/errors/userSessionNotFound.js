'use strict'

const Base      = require('./base')
const enumCodes = require('./enumCodes')

class UserSessionNotFound extends Base {
  constructor() {
    super('User session is not found')
    this.code = enumCodes.USER_SESSION_NOT_FOUND
    this.name = this.constructor.name
  }
}

module.exports = UserSessionNotFound