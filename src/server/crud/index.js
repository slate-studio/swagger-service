'use strict'

const actions   = require('./actions')
const pluralize = require('../../utils/pluralize')

const buildCrudActions = (modelName, options = {}) => {
  const sortBy       = options.sort   || { createdAt: -1 }
  const params       = options.params || []
  const searchFields = options.search
  const singularName = modelName
  const pluralName   = pluralize(modelName)

  const crud = {}

  crud[`index${pluralName}`]    = actions.index(modelName, params, sortBy, searchFields)
  crud[`read${singularName}`]   = actions.read(modelName)
  crud[`create${singularName}`] = actions.create(modelName)
  crud[`update${singularName}`] = actions.update(modelName)
  crud[`delete${singularName}`] = actions.delete(modelName)

  return crud
}

exports = module.exports = buildCrudActions
exports.helpers = require('./helpers')
exports.tests   = require('./tests')
exports.actions = actions
