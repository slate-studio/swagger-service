'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (modelName, options={}) => {
  const attributes = options.attributes || {}
  const headers    = options.headers    || {}

  return factory.create(modelName, attributes)
    .then(object => {
      const integerId = object.integerId
      const path      = actionPath(modelName, integerId)

      return request(service)
        .get(path)
        .set(headers)
        .expect(200)
        .then(res => expect(res.body.integerId).to.equal(integerId))
    })
}
