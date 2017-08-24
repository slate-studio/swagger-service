'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {
  const attributes = options.attributes || {}
  const headers    = options.headers    || {}

  const model = Model(modelName, headers)

  return factory.attrs(modelName, attributes)
    .then(params => {
      const firstParamName = _.keys(params)[0]
      const firstParam     = params[firstParamName]
      const path           = actionPath(modelName)

      return request(service)
        .post(path)
        .set(headers)
        .send(params)
        .expect(201)
        .then(res => {
          expect(res.body[firstParamName]).to.equal(firstParam)
          return res.body.integerId
        })
        .then(integerId => model.findOne({ integerId }).exec())
        .then(obj => {
          expect(obj[firstParamName]).to.equal(firstParam)
        })
    })
}
