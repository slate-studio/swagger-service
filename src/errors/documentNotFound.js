'use strict'

const Base = require('./base')

class DocumentNotFound extends Base {
  constructor(message) {
    message = message || 'Document is not found'

    super(message)
    this.code = 'DOCUMENT_NOT_FOUND'
    this.name = this.constructor.name
  }
}

module.exports = DocumentNotFound
