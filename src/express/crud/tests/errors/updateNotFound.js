'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, options={}) => {
  const id      = options.id      || '1'
  const params  = options.params  || {}
  const headers = options.headers || {}
  
  destroyAll(modelName, headers).then(() => {
    const path = actionPath(modelName, id)

    request(service)
      .put(path)
      .set(heareds)
      .send(params)
      .expect(404, done)
  })
 }
