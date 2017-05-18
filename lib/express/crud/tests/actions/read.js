'use strict'

const request    = require('supertest')
const expect     = require('chai').expect
const factory    = require('factory-girl').factory
const actionPath = require('../helpers/actionPath')

module.exports = (server, done, modelName) => {
  let objectId = null

  factory.create(modelName).then((object) => {
    objectId   = String(object._id)
    const path = actionPath(modelName, objectId)

    request(server)
      .get(path)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.status).to.equal(200)

          const doc = res.body
          expect(doc._id).to.equal(objectId)

          done(err)
        })
  })
}
