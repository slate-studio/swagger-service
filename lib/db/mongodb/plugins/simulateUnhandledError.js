'use strict'

class UnhandledMongodbError extends Error {
  constructor() {
    super('Simulated unhandled database query error')
    this.name = this.constructor.name
  }
}

const MONGOOSE_HOOKS = [
  'save',
  'update',
  'remove',
  'count',
  'find',
  'findOne',
  'findOneAndRemove',
  'findOneAndUpdate',
  'insertMany' ]

const checkUnhandledErrorFlag = (next, schema) => {
  if (schema.simulateUnhandledErrorFlag) {
    if (schema.simulateUnhandledErrorSkip == 0) {
      schema.simulateUnhandledErrorFlag = false

      const error = new UnhandledMongodbError()
      return next(error)
    }

    schema.simulateUnhandledErrorSkip -= 1
    console.log('SKIP', schema.simulateUnhandledErrorSkip)
  }

  return next()
}

module.exports = schema => {
  schema.simulateUnhandledErrorFlag = false

  MONGOOSE_HOOKS.forEach(hook => {
    schema.pre(hook, function(next) {
      checkUnhandledErrorFlag(next, schema)
    })
  })

  schema.simulateUnhandledError = (skip = 0) => {
    schema.simulateUnhandledErrorFlag = true
    schema.simulateUnhandledErrorSkip = skip
  }
}
