'use strict'

const buildCallbacks = (schema, callbacks) => {
  log.warn('Callbacks support is going to be dropped, use action callbacks.')

  // USE: beforeCreate: (object, next) =>
  //      To make changes to document you need to modify `object`.
  if (callbacks.beforeCreate) {
    schema.pre('save', function(next) {
      callbacks.beforeCreate(this, next)
    })
  }

  if (callbacks.afterCreate) {
    schema.post('save', document => {
      // NOTE: This is async, no callback option. Probably need to be changed.
      callbacks.afterCreate(document)
    })
  }

  // USE: beforeUpdate: (updateQuery, next) =>
  //      To make changes to query you need to modify `updateQuery`.
  schema.pre('findOneAndUpdate', function(next) {
    const isDeleted = this._update._deleted

    if (isDeleted) {
      if (callbacks.beforeDelete) {
        // TODO: Here we need to add additional check so callback is executed
        //       only once, but not for already deleted object.
        callbacks.beforeDelete(this, next)

      } else {
        next()

      }

    } else {
      if (callbacks.beforeUpdate) {
        callbacks.beforeUpdate(this, next)

      } else {
        next()

      }

    }
  })

  schema.post('findOneAndUpdate', document => {
    // NOTE: This is async, no callback option. Probably need to be changed.
    if (document) {
      const isDeleted = document._deleted

      if (isDeleted) {
        if (callbacks.afterDelete) {
          // TODO: Here we need to add additional check so callback is executed
          //       only once, but not for already deleted object.
          callbacks.afterDelete(document)

        }

      } else {
        if (callbacks.afterUpdate) {
          callbacks.afterUpdate(document)

        }

      }
    }
  })
}

module.exports = callbacks => {
  return schema => buildCallbacks(schema, callbacks)
}
