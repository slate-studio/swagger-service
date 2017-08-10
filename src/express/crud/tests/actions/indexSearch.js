'use strict'

const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

module.exports = (done, modelName) => {
  destroyAll(modelName).then(() => {
    factory.createMany(modelName, 3).then(() => {
      const path = actionPath(modelName, null, 'search=test')

      request(service)
        .get(path)
        .expect(200)
        .end((err, res) => {
          done(err)
        })
    })
  })
}
