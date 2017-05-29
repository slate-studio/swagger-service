'use strict'

const request    = require('supertest')
const expect     = require('chai').expect
const factory    = require('factory-girl').factory
const actionPath = require('../helpers/actionPath')

module.exports = (server, done, modelName) => {
  const modelClass = Models[modelName]

  factory.create(modelName)
    .then(object => {
      const objectIntegerId = object.integerId
      const path            = actionPath(modelName, objectIntegerId)

      request(server)
        .delete(path)
          .end((err, res) => {
            expect(res.status).to.equal(204)

            modelClass.findOne({ integerId: objectIntegerId}).exec((err1, obj) => {
              expect(obj._deleted).to.eql(true)
              done(err)
            })
          })
    })
}
