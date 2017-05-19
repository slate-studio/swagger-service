'use strict'

module.exports = (document) => {
  if (document) {
    return document

  } else {
    throw new Error('NOT_FOUND')

  }
}
