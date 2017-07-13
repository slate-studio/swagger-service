'use strict'

const request    = require('supertest')
const destroyAll = require('../helpers/destroyAll')

module.exports = (server, done, modelName, updateParams) => {
  destroyAll(modelName).then(() => {

   const path = actionPath(modelName, 1)

    request(server)
      .put(path)
        .set('Accept', 'application/json')
        .send(updateParams)
          .expect('Content-Type', /json/)
          .expect(404, done)
  })
 }
