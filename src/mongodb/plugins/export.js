'use strict'

const json2csv = require('json2csv')

module.exports = (schema, fields) => {
  schema.statics.export = function(query) {
    _.extend(query, { _deleted: false })

    return this
      .find(query)
      .sort({ createdAt: 1 })
      .lean()
      .exec()
      .then(data => json2csv({ data: data, fields: fields }))
  }
}
