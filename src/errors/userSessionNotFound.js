'use strict'

const Base = require('./base')

class UserSessionNotFound extends Base {
  constructor() {
    super('User session is not found')
    this.code = 'USER_SESSION_NOT_FOUND'
    this.name = this.constructor.name
  }
}

module.exports = UserSessionNotFound
