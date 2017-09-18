'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {
  const attributes   = options.attributes   || {}
  const headers      = options.headers      || {}
  const modelOptions = options.modelOptions || null

  const model = Model(modelName, modelOptions)

  return factory.create(modelName, attributes)
    .then(object => {
      const _id  = String(object._id)
      const path = actionPath(modelName, _id)

      return request(service)
        .delete(path)
        .set(headers)
        .expect(204)
        .then(()  => model.findOne({ _id }).exec())
        .then(obj => {
          expect(obj._deleted).to.eql(true)
        })
    })
}
