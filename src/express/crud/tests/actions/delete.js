'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath     = require('../helpers/actionPath')

class Delete extends ActionAbstract {
  run(done, attributes = {}) {
    const model = Model.getInstance(this.modelName)

    factory.create(this.factoryName || this.modelName, attributes)
      .then(object => {
        const objectId = String(object._id)
        const path     = actionPath(this.modelName, objectId)

        request(service)
          .delete(path)
          .set(this.headers)
          .expect(204)
          .end(err => {
            model.findOne({ _id: objectId}).exec()
              .then(obj => {
                expect(obj._deleted).to.eql(true)
                super.clear()
                done(err)
              })
          })
      })
  }
}

module.exports = new Delete()
