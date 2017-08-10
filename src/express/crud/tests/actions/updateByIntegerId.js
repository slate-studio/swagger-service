'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, params={}) => {
  const modelClass     = Models[modelName]
  const firstParamName = _.keys(params)[0]

  factory.create(modelName).then((object) => {
    const objectIntegerId = object.integerId
    const path            = actionPath(modelName, objectIntegerId)

    request(service)
      .put(path)
        .set('Accept', 'application/json')
        .send(params)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equal(200)

            const doc = res.body
            expect(doc[firstParamName]).to.equal(params[firstParamName])

            modelClass.findOne({ integerId: objectIntegerId }, (err1, obj) => {
              expect(obj[firstParamName]).to.equal(params[firstParamName])
              done(err)
            })
          })
  })
}
