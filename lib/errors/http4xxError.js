'use strict'

const HttpError = require('./httpError')

class Http4xxError extends HttpError {
  constructor(message, statusCode) {
    super(message, statusCode)
    this.name = 'Client Error'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http4xxError