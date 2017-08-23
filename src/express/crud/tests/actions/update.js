'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {

  const params     = options.params || {}
  const attributes = options.attributes || {}
  const headers    = options.headers || {}
  const model      = Model(modelName, headers)

  const firstParamName = _.keys(params)[0]

  return factory.create(modelName, attributes)
    .then(object => {
      const objectId = String(object._id)
      const path     = actionPath(modelName, objectId)

      return request(service)
        .put(path)
        .set(headers)
        .send(params)
        .expect(200)
        .then(res => {
          const doc = res.body
          expect(doc[firstParamName]).to.equal(params[firstParamName])
        })
        .then(() => model.findOne({ _id: objectId }).exec())
        .then(obj => {
          expect(obj[firstParamName]).to.equal(params[firstParamName])
        })
    })
}
