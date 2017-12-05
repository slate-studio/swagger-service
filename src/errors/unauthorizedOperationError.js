'use strict'

const Base = require('./base')

class UnauthorizedOperationError extends Base {
  constructor(message) {
    super('Unauthorized operation')
    this.code = 'UNAUTHORIZED_OPERATION_ERROR'
    this.name = this.constructor.name
  }
}

module.exports = UnauthorizedOperationError
