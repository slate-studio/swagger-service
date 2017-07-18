'use strict'

const Http4xxError = require('./http4xxError')

class Http404Error extends Http4xxError {
  constructor(message) {
    super(message, 404)
    this.name = 'Not Found'
    this.message = (!_.isEmpty(message) ? message : this.name)
  }
}

module.exports = Http404Error