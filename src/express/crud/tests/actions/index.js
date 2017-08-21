'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath     = require('../helpers/actionPath')
const destroyAll     = require('../helpers/destroyAll')

class Index extends ActionAbstract {
  run(done) {
    const defaultPerPage = 10

    destroyAll(this.modelName)
      .then(() => factory.createMany(this.factoryName || this.modelName, 20))
      .then(() => {
        const path = actionPath(this.modelName)

        request(service)
          .get(path)
          .set(this.headers)
          .expect(200)
          .end((err, res) => {
            expect(res.body.length).to.equal(defaultPerPage)
            super.clear()
            done(err)
          })
      })
  }
}

module.exports = new Index()
