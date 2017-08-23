'use strict'

const actions   = require('./actions')
const pluralize = require('../../utils/pluralize')

const buildCrudActions = (modelName, options = {}) => {
  const sortBy       = options.sort   || { createdAt: -1 }
  const params       = options.params || []
  const searchFields = options.search

  const model          = Model(modelName)
  const collectionName = pluralize(modelName)

  const crud = {}

  crud[`index${collectionName}`] = actions.index(model, params, sortBy, searchFields)
  crud[`read${modelName}`]       = actions.read(model)
  crud[`create${modelName}`]     = actions.create(model)
  crud[`update${modelName}`]     = actions.update(model)
  crud[`delete${modelName}`]     = actions.delete(model)

  return crud
}

exports = module.exports = buildCrudActions
exports.helpers = require('./helpers')
exports.tests   = require('./tests')
exports.actions = actions
