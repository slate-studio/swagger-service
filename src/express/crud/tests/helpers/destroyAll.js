'use strict'

const testRequestNamespace = require('./testRequestNamespace')

module.exports = modelName => {
  const namespace = testRequestNamespace.getNamespace()
  const model = Model(modelName, namespace)
  return model.find({}).remove().exec()
}
