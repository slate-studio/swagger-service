'use strict'

const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName) => {
  const defaultPerPage = 10

  destroyAll(modelName).then(() => {
    factory.createMany(modelName, 20).then(() => {
      const path = actionPath(modelName)

      request(service)
        .get(path)
        .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equal(200)

            const docs = res.body
            expect(docs.length).to.equal(defaultPerPage)

            done(err)
          })
    })
  })
}
