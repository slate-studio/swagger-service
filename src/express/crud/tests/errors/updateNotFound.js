'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, params, id='1', headers={}) => {
  destroyAll(modelName).then(() => {
    const path = actionPath(modelName, id)

    request(service)
      .put(path)
      .set(heareds)
      .send(params)
      .expect(404, done)
  })
 }
