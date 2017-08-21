'use strict'

module.exports = modelName => {
  const model = Model.getInstance(modelName)
  return model.find({}).remove().exec()
}
