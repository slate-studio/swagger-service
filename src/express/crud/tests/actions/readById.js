'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {

  const attributes = options.attributes || {}
  const headers    = options.headers || {}

  return factory.create(modelName, attributes)
    .then(object => {
      const objectId = String(object._id)
      const path     = actionPath(modelName, objectId)

      return request(service)
        .get(path)
        .set(headers)
        .expect(200)
        .then(res => {
          expect(res.body._id).to.equal(objectId)
        })
    })
}
