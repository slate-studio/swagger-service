'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, id='1') => {
  destroyAll(modelName).then(() => {
    const path = actionPath(modelName, id)

    request(service)
      .delete(path)
      .expect(404, done)
  })
}
