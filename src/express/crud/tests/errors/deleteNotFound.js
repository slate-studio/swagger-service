'use strict'

const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, id='1', headers={}) => {
  destroyAll(modelName).then(() => {
    const path = actionPath(modelName, id)

    request(service)
      .delete(path)
      .set(headers)
      .expect(404, done)
  })
}
