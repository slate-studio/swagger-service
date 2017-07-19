'use strict'

const Base = require('./base')

class UserSessionNotFound extends Base {
  constructor() {
    super('User session is not found')
    this.name = this.constructor.name
  }
}

module.exports = UserSessionNotFound