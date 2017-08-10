'use strict'

module.exports = (modelName) => {
  const model = Models[modelName]
  return model.find({}).remove().exec()
}
