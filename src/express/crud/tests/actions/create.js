'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, attributes={}) => {
  const model = Models[modelName]

  factory.attrs(modelName, attributes)
    .then(params => {
      const firstParamName = _.keys(params)[0]
      const path           = actionPath(modelName)

      request(service)
        .post(path)
        .send(params)
        .expect(201)
        .end((err, res) => {
          const doc = res.body
          expect(doc[firstParamName]).to.equal(params[firstParamName])

          model.findOne({ integerId: doc.integerId }).exec()
            .then(object => {
              expect(object[firstParamName]).to.equal(params[firstParamName])
              done(err)
            })
        })
    })
}
