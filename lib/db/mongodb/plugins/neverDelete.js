'use strict'

const MONGOOSE_HOOKS = [ 'count',
                         'find',
                         'findOne',
                         'findOneAndUpdate',
                         // NOTE: Not tested ----------------------------------
                         'update',
                         'remove',
                         'findOneAndRemove',
                         'insertMany' ]

module.exports = schema => {
  schema.add({ _deleted: { type: Boolean, default: false } })
  schema.index({ _deleted: 1 })

  schema.static('delete', function(query) {
    const params = { $set: { _deleted: true } }
    return this.findOneAndUpdate(query, params, { new: true }).exec()
  })

  _.forEach(MONGOOSE_HOOKS, hook => {
    schema.pre(hook, function(next) {
      this._conditions._deleted = false
      next()
    })
  })
}
