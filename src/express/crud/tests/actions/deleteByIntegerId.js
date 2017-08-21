'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath     = require('../helpers/actionPath')

class DeleteByIntegerId extends ActionAbstract {
  run(done, attributes = {}) {
    const model = Model.getInstance(this.modelName)

    factory.create(this.factoryName || this.modelName, attributes)
      .then(object => {
        const integerId = object.integerId
        const path      = actionPath(this.modelName, integerId)

        request(service)
          .delete(path)
          .set(this.headers)
          .expect(204)
          .end(err => {
            model.findOne({ integerId: integerId}).exec()
              .then(obj => {
                expect(obj._deleted).to.eql(true)
                super.clear()
                done(err)
              })
          })
      })
  }
}

module.exports = new DeleteByIntegerId()
