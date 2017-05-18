'use strict'

const request    = require('supertest')
const expect     = require('chai').expect
const factory    = require('factory-girl').factory
const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

module.exports = (server, done, modelName) => {
  destroyAll(modelName)

  factory.createMany(modelName, 3).then(() => {
    const path = actionPath(modelName, null, 'search=test')

    request(server)
      .get(path)
      .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          done(err)
        })
  })
}
