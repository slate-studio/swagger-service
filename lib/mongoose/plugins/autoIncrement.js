'use strict'

const mongoose  = require('mongoose')
const _         = require('lodash')

let IdentityCounter

module.exports = (schema, options) => {
  try {
    IdentityCounter = mongoose.model('IdentityCounter')

  } catch (ex) {
    if (ex.name === 'MissingSchemaError') {
      const counterSchema = new mongoose.Schema({
        model: { type: String, require: true },
        field: { type: String, require: true },
        count: { type: Number, default: 0 }
      })

      counterSchema.index({ field: 1, model: 1 }, { unique: true, required: true, index: -1 })

      IdentityCounter = mongoose.model('IdentityCounter', counterSchema)

    } else {
      throw ex

    }
  }

  const settings = {
    model:        null,
    field:        '_id',
    startAt:      0,
    incrementBy:  1,
    unique:       true
  }

  const fields = {}
  const optionsType = typeof (options)

  switch (optionsType) {
    case 'string':
      settings.model = options
      break

    case 'object':
      _.assignIn(settings, options)
      break
  }

  if (settings.model === null) {
    throw new Error('model must be set')
  }

  fields[settings.field] = {
    type:    Number,
    require: true
  }

  if (settings.field !== '_id') {
    fields[settings.field].unique = settings.unique
  }

  schema.add(fields)

  const nextCount = (callback) => {
    IdentityCounter.findOne(
      { model: settings.model, field: settings.field },
      (err, counter) => {
        if (err) {
          return callback(err)
        }

        counter = ((counter === null) ? settings.startAt : counter.count + settings.incrementBy)
        callback(null, counter)
      }
    )
  }
  schema.method('nextCount', nextCount)
  schema.static('nextCount', nextCount)

  const resetCount = function (callback) {
    IdentityCounter.findOneAndUpdate(
      { model: settings.model, field: settings.field },
      { count: settings.startAt - settings.incrementBy },
      { new: true },
      (err) => {
        if (err) {
          return callback(err)
        }
        callback(null, settings.startAt)
      }
    )
  }
  schema.method('resetCount', resetCount)
  schema.static('resetCount', resetCount)

  const params = { model: settings.model, field: settings.field }
  const initializedIdentityCounter = IdentityCounter.findOne(params).exec()
    .then(doc => {
      if (!doc) {
        const params = {
          model: settings.model,
          field: settings.field,
          count: settings.startAt - settings.incrementBy
        }

        doc = new IdentityCounter(params)
        return doc.save()

      }

      return doc
    })

  schema.pre('save', function (next) {
    const doc = this

    if (doc.isNew) {
      return initializedIdentityCounter
        .then(() => {
          const customIncrementValue = doc[settings.field]
          const isInteger            = _.isInteger(customIncrementValue)

          if (isInteger) {
            const query  = {
              model: settings.model,
              field: settings.field,
              count: { $lt: customIncrementValue }
            }

            const params = { count: customIncrementValue }

            // NOTE: This operation does nothing if customIncrementValue is less
            //       then value stored in IdentityCounter.
            return IdentityCounter.findOneAndUpdate(query, params).exec()
          }

          const query = {
            model: settings.model,
            field: settings.field
          }

          const params = {
            $inc: { count: settings.incrementBy }
          }

          return IdentityCounter.findOneAndUpdate(query, params, { new: true })
            .then((identityCounter) => doc[settings.field] = identityCounter.count)
        })
        .then(next)
        .catch(next)
    }

    return next()
  })
}
