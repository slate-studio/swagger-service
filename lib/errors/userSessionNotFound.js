'use strict'

const MainError = require('./mainError')

class UserSessionNotFound extends MainError {
  constructor() {
    super('User session is not found')
    this.name = this.constructor.name
  }
}

module.exports = UserSessionNotFound