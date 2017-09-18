'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, options={}) => {
  const id           = options.id           || '1'
  const headers      = options.headers      || {}
  const modelOptions = options.modelOptions || null
  
  destroyAll(modelName, modelOptions).then(() => {
    const path = actionPath(modelName, id)

    request(service)
      .get(path)
      .set(headers)
      .expect(500, done)
  })
}
