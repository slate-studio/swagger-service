'use strict'

const Http5xxError = require('./http5xxError')

class Http500Error extends Http5xxError {
  constructor(message) {
    super(message, 500)
    this.name = 'Internal Server Error'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http500Error