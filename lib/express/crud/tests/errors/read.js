'use strict'

const request    = require('supertest')
const destroyAll = require('../helpers/destroyAll')

module.exports = (server, done, modelName) => {
  destroyAll(modelName)

  const path = actionPath(modelName, 'BadMongoDocumentId')

  request(server)
    .get(path)
      .expect(400, done)
}
