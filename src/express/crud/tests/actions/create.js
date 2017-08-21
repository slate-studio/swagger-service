'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath     = require('../helpers/actionPath')

class Create extends ActionAbstract {
  run(done, attributes = {}) {
    const model = Model.getInstance(this.modelName)

    factory.attrs(this.factoryName || this.modelName, attributes)
      .then(params => {
        const firstParamName = _.keys(params)[0]
        const path           = actionPath(this.modelName)

        request(service)
          .post(path)
          .set(this.headers)
          .send(params)
          .expect(201)
          .end((err, res) => {
            const doc = res.body
            expect(doc[firstParamName]).to.equal(params[firstParamName])

            model.findOne({ integerId: doc.integerId }).exec()
              .then(object => {
                expect(object[firstParamName]).to.equal(params[firstParamName])
                super.clear()
                done(err)
              })
          })
      })
  }
}

module.exports = new Create()