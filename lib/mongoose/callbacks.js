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
        callbacks.beforeUpdate(this, next)
      })
    }

    if (callbacks.afterUpdate) {
      schema.post('findOneAndUpdate', function(something) {
        // TODO: Need to double check this, it looks like something is some
        //       mongoose wrapper that actually represents document in terms
        //       fields.
        if (something) {
          const document = something._doc
          callbacks.afterUpdate(document)
        }
      })
    }
  }
}
