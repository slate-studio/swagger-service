'use strict'

const Http4xxError = require('./http4xxError')

class Http423Error extends Http4xxError {
  constructor(message) {
    super(message, 423)
    this.name = 'Locked'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http423Error