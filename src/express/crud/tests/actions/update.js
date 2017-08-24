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
      const _id  = String(object._id)
      const path = actionPath(modelName, _id)

      return request(service)
        .put(path)
        .set(headers)
        .send(params)
        .expect(200)
        .then(res => expect(res.body[firstParamName]).to.equal(firstParam))
        .then(()  => model.findOne({ _id }).exec())
        .then(obj => expect(obj[firstParamName]).to.equal(firstParam))
    })
}
