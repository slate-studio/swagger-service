'use strict'

const request    = require('supertest')
const expect     = require('chai').expect
const factory    = require('factory-girl').factory
const actionPath = require('../helpers/actionPath')

module.exports = (server, done, modelName) => {
  let objectIntegerId = null

  factory.create(modelName).then((object) => {
    objectIntegerId = object.integerId
    const path      = actionPath(modelName, objectIntegerId)

    request(server)
      .get(path)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.status).to.equal(200)

          const doc = res.body
          expect(doc.integerId).to.equal(objectIntegerId)

          done(err)
        })
  })
}
