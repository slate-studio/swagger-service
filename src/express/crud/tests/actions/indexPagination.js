'use strict'

const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName, params='') => {
  destroyAll(modelName).then(() => {
    factory.createMany(modelName, 3).then(() => {
      const perPage = 2
      const path    = actionPath(modelName, null, `page=1&perPage=${perPage}&${params}`)

      request(service)
        .get(path)
        .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equal(200)

            const docs = res.body
            expect(docs.length).to.equal(2)

            done(err)
          })
    })
  })
}
