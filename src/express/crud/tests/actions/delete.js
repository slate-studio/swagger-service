'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {

  const attributes = options.attributes || {}
  const headers    = options.headers || {}

  const namespace = testRequestNamespace.getNamespace()
  const model     = Model(modelName, namespace)

  return factory.create(modelName, attributes)
    .then(object => {
      const objectId = String(object._id)
      const path     = actionPath(modelName, objectId)

      return request(service)
        .delete(path)
        .set(headers)
        .expect(204)
        .then(() => model.findOne({ _id: objectId}).exec())
        .then(obj => {
          expect(obj._deleted).to.eql(true)
        })
    })
}
