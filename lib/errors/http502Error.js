'use strict'

const Http5xxError = require('./http5xxError')

class Http502Error extends Http5xxError {
  constructor(message) {
    super(message, 502)
    this.name = 'Bad Gateway'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http502Error