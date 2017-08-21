'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath     = require('../helpers/actionPath')

class Update extends ActionAbstract {
  run(done, params = {}, attributes = {}) {
    const model = Model.getInstance(this.modelName)

    const firstParamName = _.keys(params)[0]

    factory.create(this.factoryName || this.modelName, attributes)
      .then(object => {
        const objectId = String(object._id)
        const path     = actionPath(this.modelName, objectId)

        request(service)
          .put(path)
          .set(this.headers)
          .send(params)
          .expect(200)
          .end((err, res) => {
            const doc = res.body
            expect(doc[firstParamName]).to.equal(params[firstParamName])

            model.findOne({ _id: objectId }).exec()
              .then(obj => {
                expect(obj[firstParamName]).to.equal(params[firstParamName])
                super.clear()
                done(err)
              })
          })
      })
  }
}

module.exports = new Update()
