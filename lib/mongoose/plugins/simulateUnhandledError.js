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
    schema.simulateUnhandledErrorFlag = false

    const err = new Error('SIMULATED_MONGOOSE_UNHANDLED_ERROR')
    next(err)

  } else {
    next()

  }
}

module.exports = (schema) => {
  schema.simulateUnhandledErrorFlag = false

  MONGOOSE_HOOKS.forEach((hook) => {
    schema.pre(hook, function(next) {
      checkUnhandledErrorFlag(next, schema)
    })
  })

  schema.simulateUnhandledError = () => {
    schema.simulateUnhandledErrorFlag = true
  }
}
