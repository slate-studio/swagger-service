'use strict'

const actionPath = require('../helpers/actionPath')

module.exports = (done, modelName, params={}) => {
  const modelClass = Models[modelName]

  const firstParamName = _.keys(params)[0]

  factory.create(modelName).then((object) => {
    const objectId = String(object._id)
    const path     = actionPath(modelName, objectId)

    request(service)
      .put(path)
        .set('Accept', 'application/json')
        .send(params)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equal(200)

            const doc = res.body
            expect(doc[firstParamName]).to.equal(params[firstParamName])

            modelClass.findOne({ _id: objectId }, (err, obj) => {
              expect(obj[firstParamName]).to.equal(params[firstParamName])
              done(err)
            })
          })
  })
}
