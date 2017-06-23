'use strict'

module.exports = (callbacks) => {
  return (schema) => {
    // USE: beforeCreate: (object, next) =>
    //      To make changes to document you need to modify `object`.
    if (callbacks.beforeCreate) {
      schema.pre('save', function(next) {
        callbacks.beforeCreate(this, next)
      })
    }

    if (callbacks.afterCreate) {
      schema.post('save', (document) => {
        callbacks.afterCreate(document)
      })
    }

    // USE: beforeUpdate: (updateQuery, next) =>
    //      To make changes to query you need to modify `updateQuery`.
    if (callbacks.beforeUpdate) {
      schema.pre('findOneAndUpdate', function(next) {
        const isDeleted = this._update._deleted

        if(!isDeleted){
          callbacks.beforeUpdate(this, next)
        } else {
          next()
        }
      })
    }

    if (callbacks.afterUpdate) {
      schema.post('findOneAndUpdate', (document) => {
        // NOTE: Document might not be found and update not happen.
        const isDeleted = document._deleted

        if (document && !isDeleted) {
          callbacks.afterUpdate(document)
        } else {
          next()
        }
      })
    }
  }
}
