'use strict'

const json2csv = require('json2csv')

module.exports = schema => {
  schema.index({ _deleted: 1, createdAt: 1 })
  schema.static('export', function(query) {
    const fields = schema.fields

    return this.find(query).sort({ createdAt: 1 }).lean()
      .then(data => json2csv({ data, fields }))
  })

  schema.fields = []
  schema.exportsOnly = fields => schema.fields = fields
}
