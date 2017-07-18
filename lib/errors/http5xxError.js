'use strict'

const HttpError = require('./httpError')

class Http5xxError extends HttpError {
  constructor(message, statusCode) {
    super(message, statusCode)
    this.name = 'Server Error'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http5xxError