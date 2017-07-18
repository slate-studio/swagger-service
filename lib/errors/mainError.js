'use strict'

class MainError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }

  getStatusCode() {
    return _.get(this, 'statusCode', null)
  }

  toString() {
    return this.message + ': ' + this.stack
  }
}

module.exports = MainError