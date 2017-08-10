'use strict'

const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName) => {
  const defaultPerPage = 10

  destroyAll(modelName)
    .then(() => factory.createMany(modelName, 20))
    .then(() => {
      const path = actionPath(modelName)

      request(service)
        .get(path)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(defaultPerPage)

          done(err)
        })
    })
}
