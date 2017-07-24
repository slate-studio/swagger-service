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
  if (schema.simulateUnhandledError) {
    schema.simulateUnhandledError = false

    const err = new Error('SIMULATED_MONGOOSE_UNHANDLED_ERROR')
    next(err)

  } else {
    next()

  }
}

module.exports = (schema) => {
  schema.simulateUnhandledError = false

  MONGOOSE_HOOKS.forEach((hook) => {
    schema.pre(hook, function(next) {
      checkUnhandledErrorFlag(next, schema)
    })
  })

  schema.simulateUnhandledError = () => {
    schema.simulateUnhandledError = true
  }
}
