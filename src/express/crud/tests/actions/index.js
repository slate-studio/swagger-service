'use strict'

const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

const DEFAULT_PER_PAGE = 10

module.exports = (modelName, options={}) => {
  const headers = options.headers || {}

  return destroyAll(modelName, headers)
    .then(() => factory.createMany(modelName, 20))
    .then(() => {
      const path = actionPath(modelName)

      return request(service)
        .get(path)
        .set(headers)
        .expect(200)
        .then(res => expect(res.body.length).to.equal(DEFAULT_PER_PAGE))
    })
}
