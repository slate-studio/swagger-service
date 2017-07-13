'use strict'

module.exports = (modelName) => {
  const modelClass = Models[modelName]
  return modelClass.find({}).remove().exec()
}
