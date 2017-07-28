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

  switch (typeof (options)) {
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
    type: Number,
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

  const initData = new Promise((resolve, reject) => {
    IdentityCounter.findOne(
      { model: settings.model, field: settings.field },
      (err, counter) => {
        if (!err) {

          if (!counter) {
            const params = {
              model: settings.model,
              field: settings.field,
              count: settings.startAt - settings.incrementBy
            }
            counter = new IdentityCounter(params)
            counter.save(() => {
              resolve()
            })
          } else {
            resolve()
          }

        } else {
          reject(new Error(err))
        }
      }
    )
  })

  schema.pre('save', function (next) {
    const doc = this

    if (doc.isNew) {
      initData.then(() => {
        if (typeof doc[settings.field] === 'number') {
          IdentityCounter.findOneAndUpdate(
            { model: settings.model, field: settings.field, count: { $lt: doc[settings.field] } },
            { count: doc[settings.field] },
            (err) => {
              if (err) {
                return next(err)
              }
              next()
            }
          )
        } else {
          IdentityCounter.findOneAndUpdate(
            { model: settings.model, field: settings.field },
            { $inc: { count: settings.incrementBy } },
            { new: true },
            (err, updatedIdentityCounter) => {
              if (err) {
                return next(err)
              }
              doc[settings.field] = updatedIdentityCounter.count
              next()
            }
          )
        }
      }).catch(err => {
        next(err)
      })
    } else {
      next()
    }
  })
}
