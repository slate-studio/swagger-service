'use strict'

const Base = require('./base')

class DocumentNotFound extends Base {
  constructor() {
    super('Document is not found')
    this.code = 'DOCUMENT_NOT_FOUND'
    this.name = this.constructor.name
  }
}

module.exports = DocumentNotFound
