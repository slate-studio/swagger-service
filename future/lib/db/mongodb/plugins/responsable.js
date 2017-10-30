'use strict'

const _ = require('lodash')

module.exports = schema => {
  schema.method('toResponse', function() {
    const object = this.toObject()

    _.forEach(object, (value, key) => {
      const isHiddenField = _.startsWith(key, '_')

      if (isHiddenField) {
        delete object[key]
      }
    })

    return object
  })
}
