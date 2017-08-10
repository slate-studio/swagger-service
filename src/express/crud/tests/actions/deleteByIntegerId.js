'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName) => {
  const modelClass = Models[modelName]

  factory.create(modelName)
    .then(object => {
      const objectIntegerId = object.integerId
      const path            = actionPath(modelName, objectIntegerId)

      request(service)
        .delete(path)
          .end((err, res) => {
            expect(res.status).to.equal(204)

            modelClass.findOne({ integerId: objectIntegerId}).exec((err1, obj) => {
              expect(obj._deleted).to.eql(true)
              done(err)
            })
          })
    })
}
