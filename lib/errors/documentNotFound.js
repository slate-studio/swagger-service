'use strict'

const MainError = require('./mainError')

class DocumentNotFound extends MainError {
  constructor() {
    super('Document is not found')
    this.name = this.constructor.name
  }
}

module.exports = DocumentNotFound