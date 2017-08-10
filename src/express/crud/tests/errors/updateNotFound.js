'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, updateParams) => {
  destroyAll(modelName).then(() => {

    const path = actionPath(modelName, 1)

    request(service)
      .put(path)
        .set('Accept', 'application/json')
        .send(updateParams)
          .expect('Content-Type', /json/)
          .expect(404, done)
  })
 }
