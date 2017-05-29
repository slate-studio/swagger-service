'use strict'

global._ = require('lodash')

module.exports = {
  index:             require('./actions/index'),
  indexParameters:   require('./actions/indexParameters'),
  indexSearch:       require('./actions/indexSearch'),
  readById:          require('./actions/readById'),
  readByIntegerId:   require('./actions/readByIntegerId'),
  create:            require('./actions/create'),
  update:            require('./actions/update'),
  updateByIntegerId: require('./actions/updateByIntegerId'),
  delete:            require('./actions/delete'),
  deleteByIntegerId: require('./actions/deleteByIntegerId'),

  // TODO: These might be not required, or should moved to /test folder.
  createError:         require('./errors/create'),
  deleteError:         require('./errors/delete'),
  deleteNotFoundError: require('./errors/deleteNotFound'),
  readError:           require('./errors/read'),
  readNotFoundError:   require('./errors/readNotFound'),
  updateNotFoundError: require('./errors/updateNotFound')
}

// const factory = require('factory-girl').factory
// const request = require('supertest')
// const expect  = require('chai').expect

//   indexArrayParams: (server, done, modelName) => {
//     destroyAll(modelName)
//     factory.createMany(modelName, 3).then(() => {
//       const path = actionPath(modelName, null, '')
//       const arrayParams = {unitIds: ['1', '2'] }
//       request(server)
//         .get(path)
//           .query(arrayParams)
//           .set('Accept', 'application/json')
//             .end((err, res) => {
//               expect(res.status).to.equal(200)
//               done(err)
//             })
//     })
//   },

//   indexIncludeDeleted: (server, done, modelName) => {
//     destroyAll(modelName)
//     factory.createMany(modelName, 1).then(() => {
//       factory.create(modelName, { _deleted: true }).then(() => {
//         const perPage = 2
//         const path = actionPath(modelName, null, `page=1&perPage=${perPage}&includeDeleted=true`)
//         request(server)
//           .get(path)
//             .set('Accept', 'application/json')
//               .expect('Content-Type', /json/)
//                 .end((err, res) => {
//                   expect(res.status).to.equal(200)
//                   var docs = res.body
//                   expect(docs.length).to.equal(2)
//                   done(err)
//                 })
//       })
//     })
//   },
