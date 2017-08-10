'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  const model = Models[modelName]

  factory.create(modelName, attributes)
    .then(object => {
      const objectId = String(object._id)
      const path     = actionPath(modelName, objectId)

      request(service)
        .delete(path)
        .expect(204)
        .end((err, res) => {
          model.findOne({ _id: objectId}).exec()
            .then(obj => {
              expect(obj._deleted).to.eql(true)
              done(err)
            })
        })
    })
}
