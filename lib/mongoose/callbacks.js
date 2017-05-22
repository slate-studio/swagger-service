'use strict'

module.exports = (callbacks) => {
  return (schema) => {
    if (callbacks.beforeCreate) {
      schema.pre('save', function(next) {
        callbacks.beforeCreate(this, (params={}) => {
          _.extend(this, params)
          next()
        })
      })
    }

    if (callbacks.afterCreate) {
      schema.post('save', (document) => {
        callbacks.afterCreate(document)
      })
    }

    if (callbacks.beforeUpdate) {
      schema.pre('findOneAndUpdate', function(next) {
        callbacks.beforeUpdate(this, (params={}) => {
          _.extend(this, params)
          next()
        })
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
