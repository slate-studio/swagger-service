'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  factory.create(modelName, attributes)
    .then(object => {
      const objectId = String(object._id)
      const path     = actionPath(modelName, objectId)

      request(service)
        .get(path)
        .expect(200)
        .end((err, res) => {
          expect(res.body._id).to.equal(objectId)

          done(err)
        })
    })
}
