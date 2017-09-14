'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}, headers={}) => {
  factory.attrs(modelName).then((params) => {
    _.extend(params, attributes)

    const path = actionPath(modelName)

    request(service)
      .post(path)
      .set(headers)
      .send(params)
      .expect(422, done)
  })
}
