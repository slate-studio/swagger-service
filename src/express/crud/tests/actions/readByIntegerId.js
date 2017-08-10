'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName) => {
  factory.create(modelName)
    .then(object => {
      const path = actionPath(modelName, object.integerId)

      request(service)
        .get(path)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equal(200)

            const doc = res.body
            expect(doc.integerId).to.equal(object.integerId)

            done(err)
          })
    })
}
