'use strict'

const documentNotFound = require('./../../../errors/documentNotFound')

module.exports = (document) => {
  if (document) {
    return document

  } else {
    throw new documentNotFound()

  }
}
