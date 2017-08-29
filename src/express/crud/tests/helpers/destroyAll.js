'use strict'

module.exports = (modelName, options = {}) => {

  const model = Model(modelName, options)

  return model.find({}).remove().exec()
}
