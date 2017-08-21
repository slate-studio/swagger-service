'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

class indexSearch extends ActionAbstract {
  run(done) {
    destroyAll(this.modelName)
      .then(() => factory.createMany(this.factoryName || this.modelName, 3))
      .then(() => {
        const path = actionPath(this.modelName, null, 'search=test')

        request(service)
          .get(path)
          .set(this.headers)
          .expect(200)
          .end(err => {
            super.clear()
            done(err)
          })
      })
  }
}

module.exports = new indexSearch()
