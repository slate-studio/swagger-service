'use strict'

const ActionAbstract = require('./actionAbstract')
const actionPath = require('../helpers/actionPath')
const destroyAll = require('../helpers/destroyAll')

class IndexPagination extends ActionAbstract {
  run(done, params = '') {
    destroyAll(this.modelName)
      .then(() => factory.createMany(this.factoryName || this.modelName, 3))
      .then(() => {
        const perPage = 2
        const path    = actionPath(this.modelName, null, `page=1&perPage=${perPage}&${params}`)

        request(service)
          .get(path)
          .set(this.headers)
          .expect(200)
          .end((err, res) => {
            const docs = res.body
            expect(docs.length).to.equal(2)
            super.clear()
            done(err)
          })
      })
  }
}

module.exports = new IndexPagination()
