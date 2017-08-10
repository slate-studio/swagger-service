'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  factory.create(modelName, attributes)
    .then(object => {
      const path = actionPath(modelName, object.integerId)

      request(service)
        .get(path)
        .expect(200)
        .end((err, res) => {
          expect(res.body.integerId).to.equal(object.integerId)

          done(err)
        })
    })
}
