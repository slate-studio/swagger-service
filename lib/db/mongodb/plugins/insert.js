'use strict'

// TODO: Finish this as a plugin.
// const _ = require('lodash')

// module.exports = (modelName, data) => {
//   let model = null

//   if (_.isEmpty(data)) {
//     return Promise.resolve()
//   }

//   const inserts = _.map(data, (item, index) => {

//     const document = item.document || item
//     const options  = item.options  || {}
//     model          = Model(modelName, options)

//     document.integerId = document.integerId || index + 1

//     const timestamp = new Date()
//     document.createdAt = document.createdAt || timestamp
//     document.updatedAt = document.updatedAt || timestamp
//     document.createBy  = document.createBy  || timestamp
//     document.updatedBy = document.updatedBy || timestamp

//     document._deleted  = document._deleted  || false

//     return model.collection.insert(document)
//   })

//   return Promise.all(inserts)
//     .then(model.nextCount)
//     .then(nextCount => nextCount - 1 + data.length)
//     .then(newCount => model.setCount(newCount))
//     .then(() => log.info(`${modelName}:`, data.length))
// }
