'use strict'

const MainError = require('./mainError')

class HttpError extends MainError {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
  }
}

module.exports = HttpError