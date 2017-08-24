'use strict'

const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

module.exports = (modelName, options={}) => {
  const params  = options.params  || ''
  const headers = options.headers || {}

  return destroyAll(modelName, headers)
    .then(() => factory.createMany(modelName, 3))
    .then(() => {
      const perPage = 2
      const path = actionPath(modelName, null, `page=1&perPage=${perPage}&${params}`)

      return request(service)
        .get(path)
        .set(headers)
        .expect(200)
        .then(res => expect(res.body.length).to.equal(2))
    })
}
