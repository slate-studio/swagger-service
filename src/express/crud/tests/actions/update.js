'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, params={}, attributes={}) => {
  const model = Models[modelName]

  const firstParamName = _.keys(params)[0]

  factory.create(modelName, attributes)
    .then(object => {
      const objectId = String(object._id)
      const path     = actionPath(modelName, objectId)

      request(service)
        .put(path)
        .send(params)
        .expect(200)
        .end((err, res) => {
          const doc = res.body
          expect(doc[firstParamName]).to.equal(params[firstParamName])

          model.findOne({ _id: objectId }).exec()
            .then(obj => {
              expect(obj[firstParamName]).to.equal(params[firstParamName])
              done(err)
            })
        })
    })
}
