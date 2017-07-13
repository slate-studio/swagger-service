'use strict'

const request    = require('supertest')
const destroyAll = require('../helpers/destroyAll')

module.exports = (server, done, modelName) => {
  destroyAll(modelName).then(() => {
    const path = actionPath(modelName, 'BadMongoDocumentId')

    request(server)
      .delete(path)
        .expect(400, done)

  })
}
