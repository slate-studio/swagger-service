'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {
  const attributes = options.attributes || {}
  const headers    = options.headers    || {}

  const model = Model(modelName, headers)

  return factory.create(modelName, attributes)
    .then(object => {
      const integerId = object.integerId
      const path      = actionPath(modelName, integerId)

      return request(service)
        .delete(path)
        .set(headers)
        .expect(204)
        .then(()  => model.findOne({ integerId }).exec())
        .then(obj => {
          expect(obj._deleted).to.eql(true)
        })
    })
}
