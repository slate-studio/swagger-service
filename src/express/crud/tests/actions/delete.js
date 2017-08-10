'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  const modelClass = Models[modelName]

  factory.create(modelName, attributes)
    .then(object => {
      const objectId = String(object._id)
      const path     = actionPath(modelName, objectId)

      request(service)
        .delete(path)
          .end((err, res) => {
            expect(res.status).to.equal(204)

            modelClass.findOne({ _id: objectId}).exec()
              .then(obj => expect(obj._deleted).to.eql(true))
              .then(() => done(err))
          })
    })
}
