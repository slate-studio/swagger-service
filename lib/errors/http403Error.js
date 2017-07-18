'use strict'

const Http4xxError = require('./http4xxError')

class Http403Error extends Http4xxError {
  constructor(message) {
    super(message, 403)
    this.name = 'Forbidden'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http403Error