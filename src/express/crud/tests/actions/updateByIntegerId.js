'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options = {}) => {
  const params     = options.params     || {}
  const attributes = options.attributes || {}
  const headers    = options.headers    || {}

  const model = Model(modelName, headers)

  const firstParamName = _.keys(params)[0]
  const firstParam     = params[firstParamName]

  return factory.create(modelName, attributes)
    .then(object => {
      const integerId = object.integerId
      const path      = actionPath(modelName, integerId)

      return request(service)
        .put(path)
        .set(headers)
        .send(params)
        .expect(200)
        .then(res => expect(res.body[firstParamName]).to.equal(firstParam))
        .then(()  => model.findOne({ integerId }).exec())
        .then(obj => expect(obj[firstParamName]).to.equal(firstParam))
    })
}
