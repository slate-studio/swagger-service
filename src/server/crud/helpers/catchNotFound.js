'use strict'

const documentNotFound = require('./../../../errors/documentNotFound')

module.exports = (model) =>{
  let name = 'Document'

  if (model) {
    name = _.upperFirst(model.modelName)
  }

  return (document) => {
    if (document) {
      return document

    } else {
      throw new documentNotFound(`${name} is not found`)

    }
  }
}
