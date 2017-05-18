'use strict'

const request    = require('supertest')
const expect     = require('chai').expect
const factory    = require('factory-girl').factory
const actionPath = require('../helpers/actionPath')

module.exports = (server, done, modelName) => {
  const modelClass = Models[modelName]

  factory.attrs(modelName).then((params) => {
    const firstParamName = _.keys(params)[0]
    const path           = actionPath(modelName)

    request(server)
      .post(path)
        .set('Accept', 'application/json')
        .send(params)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equal(201)
            const doc = res.body
            expect(doc[firstParamName]).to.equal(params[firstParamName])

            modelClass.findOne({ _id: doc._id }, (err1, object) => {
              expect(object[firstParamName]).to.equal(params[firstParamName])
              done(err)
            })
          })
  })
}
