'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath = require('../helpers/actionPath')

class ReadById extends ActionAbstract {
  run(done, attributes = {}) {
    factory.create(this.factoryName || this.modelName, attributes)
      .then(object => {
        const objectId = String(object._id)
        const path     = actionPath(this.modelName, objectId)

        request(service)
          .get(path)
          .set(this.headers)
          .expect(200)
          .end((err, res) => {
            expect(res.body._id).to.equal(objectId)
            super.clear()
            done(err)
          })
      })
  }
}

module.exports = new ReadById()
