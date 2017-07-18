'use strict'

const Http4xxError = require('./http4xxError')

class Http422Error extends Http4xxError {
  constructor(message) {
    super(message, 422)
    this.name = 'Unprocessable Entity'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http422Error