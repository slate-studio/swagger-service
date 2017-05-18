'use strict'

const request    = require('supertest')
const destroyAll = require('../helpers/destroyAll')

module.exports = (server, done, modelName) => {
  destroyAll(modelName)

  const path = actionPath(modelName, 1)

  request(server)
    .get(path)
      .expect(404, done)
}
