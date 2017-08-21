'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath = require('../helpers/actionPath')

class ReadByIntegerId extends ActionAbstract {
  run(done, attributes = {}) {
    factory.create(this.factoryName || this.modelName, attributes)
      .then(object => {
        const path = actionPath(this.modelName, object.integerId)

        request(service)
          .get(path)
          .set(this.headers)
          .expect(200)
          .end((err, res) => {
            expect(res.body.integerId).to.equal(object.integerId)
            super.clear()
            done(err)
          })
      })
  }
}

module.exports = new ReadByIntegerId()
