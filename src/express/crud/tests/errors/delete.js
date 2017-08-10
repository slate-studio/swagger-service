'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName) => {
  destroyAll(modelName).then(() => {
    const path = actionPath(modelName, 'BadMongoDocumentId')

    request(service)
      .delete(path)
        .expect(400, done)

  })
}
