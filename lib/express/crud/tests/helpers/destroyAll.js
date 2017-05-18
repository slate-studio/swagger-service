'use strict'

module.exports = (modelName) => {
  const modelClass = Models[modelName]
  modelClass.find({}).remove().exec()
}
