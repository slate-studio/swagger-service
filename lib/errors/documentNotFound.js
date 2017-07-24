'use strict'

const Base      = require('./base')
const enumCodes = require('./enumCodes')

class DocumentNotFound extends Base {
  constructor() {
    super('Document is not found')
    this.code = enumCodes.DOCUMENT_NOT_FOUND
    this.name = this.constructor.name
  }
}

module.exports = DocumentNotFound