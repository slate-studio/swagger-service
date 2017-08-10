'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName) => {
  destroyAll(modelName).then(() => {
    const path = actionPath(modelName, 1)

    request(service)
      .get(path)
        .expect(404, done)

  })
}
