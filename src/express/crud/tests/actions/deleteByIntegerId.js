'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  const model = Models[modelName]

  factory.create(modelName, attributes)
    .then(object => {
      const integerId = object.integerId
      const path      = actionPath(modelName, integerId)

      request(service)
        .delete(path)
          .expect(204)
          .end((err, res) => {
            model.findOne({ integerId: integerId}).exec()
              .then(obj => {
                expect(obj._deleted).to.eql(true)
                done(err)
              })
          })
    })
}
