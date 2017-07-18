'use strict'

const Http4xxError = require('./http4xxError')

class Http401Error extends Http4xxError {
  constructor(message) {
    super(message, 401)
    this.name = 'Unauthorized'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http401Error