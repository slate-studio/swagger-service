'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {

  const attributes = options.attributes || {}
  const headers    = options.headers || {}

  const namespace = testRequestNamespace.getNamespace()
  const model     = Model(modelName, namespace)

  return factory.attrs(modelName, attributes)
    .then(params => {
      const firstParamName = _.keys(params)[0]
      const path           = actionPath(modelName)

      return request(service)
        .post(path)
        .set(headers)
        .send(params)
        .expect(201)
        .then(res => {
          const doc = res.body
          expect(doc[firstParamName]).to.equal(params[firstParamName])
          return doc.integerId
        })
        .then((integerId) => model.findOne({ integerId: integerId }).exec())
        .then(object => {
          expect(object[firstParamName]).to.equal(params[firstParamName])
        })
    })
}