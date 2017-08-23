'use strict'

const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

module.exports = (modelName, options = {}) => {

  const headers = options.headers || {}

  return destroyAll(modelName, headers)
    .then(() => factory.createMany(modelName, 3))
    .then(() => {
      const path = actionPath(modelName, null, 'search=test')

      return request(service)
        .get(path)
        .set(headers)
        .expect(200)
        .then(() => null)
    })
}
