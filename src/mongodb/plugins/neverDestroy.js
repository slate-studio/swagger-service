'use strict'

module.exports = (schema) => {
  schema.add({ _deleted: { type: Boolean, default: false } })
  schema.index({ _deleted: 1 })
}
