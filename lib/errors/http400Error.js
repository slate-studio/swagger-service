'use strict'

const Http4xxError = require('./http4xxError')

class Http400Error extends Http4xxError {
  constructor(message) {
    super(message, 400)
    this.name = 'Bad Request'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http400Error