'use strict'

const _ = require('lodash')

const defaults = {
  field:       'integerId',
  startAt:     1,
  incrementBy: 1
}

class MissingModelNameError extends Error {
  constructor() {
    super('Model name is not defined in options')
    this.name = this.constructor.name
  }
}

class BadAutoIncrementFieldValueError extends Error {
  constructor() {
    super('Auto incremented value is not a number')
    this.name = this.constructor.name
  }
}

class UpdateAutoIncrementFieldValueError extends Error {
  constructor() {
    super('Update of auto incremented value is forbidden')
    this.name = this.constructor.name
  }
}

module.exports = (schema, { model, mongoose }) => {
  if (!model) {
    throw new MissingModelNameError()
  }

  let IdentityCounter

  try {
    IdentityCounter = mongoose.model('IdentityCounter')

  } catch (error) {
    if (error.name === 'MissingSchemaError') {
      const counterSchema = new mongoose.Schema({
        model: { type: String, require: true },
        field: { type: String, require: true },
        count: { type: Number, default: 0 }
      })

      counterSchema.index({ field: 1, model: 1 }, { unique: true })

      IdentityCounter = mongoose.model('IdentityCounter', counterSchema)

    } else {
      throw error

    }
  }

  const fields   = {}
  const settings = _.assignIn({}, defaults, { model })

  fields[settings.field] = {
    type:    Number,
    require: true,
    unique:  true
  }

  schema.add(fields)

  const query = _.pick(settings, [ 'model', 'field' ])
  const initializeIdentityCounter = IdentityCounter.findOne(query).exec()
    .then(counter => {
      if (counter) {
        return null
      }

      const params = _.pick(settings, ['model', 'field'])
      params.count = settings.startAt - settings.incrementBy

      counter = new IdentityCounter(params)
      return counter.save()
    })


  const nextCount = () => {
    return initializeIdentityCounter
      .then(() => {
        const query = _.pick(settings, ['model', 'field'])
        return IdentityCounter.findOne(query).exec()
      })
      .then(counter => {
        if (counter === null) {
          return settings.startAt
        }

        return counter.count + settings.incrementBy
      })
  }
  schema.method('nextCount', nextCount)
  schema.static('nextCount', nextCount)


  const resetCount = () => {
    return initializeIdentityCounter
      .then(() => {
        const query  = _.pick(settings, ['model', 'field'])
        const params = { count: settings.startAt - settings.incrementBy }

        return IdentityCounter.findOneAndUpdate(query, params, { new: true })
      })
      .then(() => settings.startAt)
  }
  schema.method('resetCount', resetCount)
  schema.static('resetCount', resetCount)


  const setCount = value => {
    value = parseInt(value)

    return initializeIdentityCounter
      .then(() => {
        const query  = _.pick(settings, [ 'model', 'field' ])
        const params = { count: value }

        return IdentityCounter.findOneAndUpdate(query, params).exec()
      })
      .then(() => value)
  }
  schema.method('setCount', setCount)
  schema.static('setCount', setCount)


  schema.pre('save', function(next) {
    if (this.isNew) {
      const count = this[settings.field]

      return initializeIdentityCounter
        .then(() => {
          const query = _.pick(settings, [ 'model', 'field' ])

          if (count) {
            const isCountInteger = _.isInteger(count)

            if (isCountInteger) {
              query.count = { $lt: count }

              // NOTE: This operation does nothing if count is less then value
              //       stored in IdentityCounter and would raise exception if
              //       count value is not unique.
              return IdentityCounter.findOneAndUpdate(query, { count }).exec()

            } else {
              throw new BadAutoIncrementFieldValueError()

            }
          }

          const params = { $inc: { count: settings.incrementBy } }

          return IdentityCounter.findOneAndUpdate(query, params, { new: true })
            .then(identityCounter => this[settings.field] = identityCounter.count)
        })
        .then(next)
        .catch(next)

    } else {
      const isUpdateAutoIncrementField = _.includes(this.modifiedPaths(), settings.field)

      if (isUpdateAutoIncrementField) {
        return next(new UpdateAutoIncrementFieldValueError())
      }
    }

    return next()
  })
}
