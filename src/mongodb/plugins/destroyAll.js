'use strict'

module.exports = schema => {
  schema.statics.destroyAll = function() {
    return this.find({}).remove().exec()
  }
}
