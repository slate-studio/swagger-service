'use strict'

const MONGOOSE_HOOKS = [ 'save',
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

      const err = new Error('SIMULATED_MONGOOSE_UNHANDLED_ERROR')
      return next(err)
    }

    schema.simulateUnhandledErrorSkip -= 1
  }

  return next()
}

module.exports = (schema) => {
  schema.simulateUnhandledErrorFlag = false

  MONGOOSE_HOOKS.forEach((hook) => {
    schema.pre(hook, function(next) {
      checkUnhandledErrorFlag(next, schema)
    })
  })

  schema.simulateUnhandledError = (skip=0) => {
    schema.simulateUnhandledErrorFlag = true
    schema.simulateUnhandledErrorSkip = skip
  }
}
