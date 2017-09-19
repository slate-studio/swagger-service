'use strict'

module.exports = (modelName, headers={}) => {

  const model = Model(modelName, headers)

  return model.find({}).remove().exec()
}
