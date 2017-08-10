'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  const modelClass = Models[modelName]

  factory.attrs(modelName, attributes)
    .then(params => {
      const firstParamName = _.keys(params)[0]
      const path           = actionPath(modelName)

      request(service)
        .post(path)
          .set('Accept', 'application/json')
          .send(params)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.status).to.equal(201)

              const doc = res.body
              expect(doc[firstParamName]).to.equal(params[firstParamName])

              modelClass.findOne({ integerId: doc.integerId }).exec()
                .then(object => {
                  expect(object[firstParamName]).to.equal(params[firstParamName])
                })
                .then(() => done(err))
            })
    })
}
