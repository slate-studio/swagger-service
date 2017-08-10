'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, id='1') => {
  destroyAll(modelName).then(() => {
    const path = actionPath(modelName, id)

    request(service)
      .get(path)
      .expect(500, done)
  })
}
