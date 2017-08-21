'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath     = require('../helpers/actionPath')

class UpdateByIntegerId extends ActionAbstract {
  run(done, params = {}, attributes = {}) {
    const modelClass     = Model.getInstance(this.modelName)
    const firstParamName = _.keys(params)[0]

    factory.create(this.factoryName || this.modelName, attributes)
      .then(object => {
        const objectIntegerId = object.integerId
        const path            = actionPath(this.modelName, objectIntegerId)

        request(service)
          .put(path)
          .set(this.headers)
          .send(params)
          .expect(200)
          .end((err, res) => {
            const doc = res.body
            expect(doc[firstParamName]).to.equal(params[firstParamName])

            modelClass.findOne({ integerId: objectIntegerId }).exec()
              .then(obj => {
                expect(obj[firstParamName]).to.equal(params[firstParamName])
                super.clear()
                done(err)
              })
          })
      })
  }
}

module.exports = new UpdateByIntegerId()
