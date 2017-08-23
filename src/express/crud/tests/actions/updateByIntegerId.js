'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {

  const params     = options.params || {}
  const attributes = options.attributes || {}
  const headers    = options.headers || {}

  const namespace      = testRequestNamespace.getNamespace()
  const modelClass     = Model(modelName, namespace)
  const firstParamName = _.keys(params)[0]

  return factory.create(modelName, attributes)
    .then(object => {
      const objectIntegerId = object.integerId
      const path            = actionPath(modelName, objectIntegerId)

      return request(service)
        .put(path)
        .set(headers)
        .send(params)
        .expect(200)
        .then(res => {
          const doc = res.body
          expect(doc[firstParamName]).to.equal(params[firstParamName])
        })
        .then(() => modelClass.findOne({ integerId: objectIntegerId }).exec())
        .then(obj => {
          expect(obj[firstParamName]).to.equal(params[firstParamName])
        })
    })
}
