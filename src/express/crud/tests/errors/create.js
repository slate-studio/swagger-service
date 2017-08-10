'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  factory.attrs(modelName).then((params) => {
    _.extend(params, attributes)

    const path = actionPath(modelName)

    request(service)
      .post(path)
      .send(params)
      .expect(422, done)
  })
}
