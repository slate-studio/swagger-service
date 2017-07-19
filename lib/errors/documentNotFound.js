'use strict'

const Base = require('./base')

class DocumentNotFound extends Base {
  constructor() {
    super('Document is not found')
    this.name = this.constructor.name
  }
}

module.exports = DocumentNotFound