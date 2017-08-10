'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, params={}, attributes={}) => {
  const modelClass     = Models[modelName]
  const firstParamName = _.keys(params)[0]

  factory.create(modelName, attributes).then((object) => {
    const objectIntegerId = object.integerId
    const path            = actionPath(modelName, objectIntegerId)

    request(service)
      .put(path)
      .send(params)
      .expect(200)
      .end((err, res) => {
        const doc = res.body
        expect(doc[firstParamName]).to.equal(params[firstParamName])

        modelClass.findOne({ integerId: objectIntegerId }).exec()
          .then(obj => {
            expect(obj[firstParamName]).to.equal(params[firstParamName])
            done(err)
          })
      })
  })
}
