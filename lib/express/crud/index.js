'use strict'

const index   = require('./actions/index')
const read    = require('./actions/read')
const create  = require('./actions/create')
const update  = require('./actions/update')
const del     = require('./actions/delete')

const builder = (model, options = {}) => {
  const sortBy       = options.sort         || { createdAt: -1 }
  const defaultScope = options.defaultScope || { _deleted: false }
  const params       = options.params       || []
  // TODO: should not be a separte thing here, what arrayParams suppose to mean?
  const arrayParams  = options.arrayParams  || []
  const searchFields = options.search

  const modelName      = _.upperFirst(model.modelName)
  const collectionName = _.upperFirst(_.camelCase(model.collection.name))

  const actions = {}

  actions[`index${collectionName}`] = index(model, defaultScope, params, arrayParams, sortBy, searchFields)
  actions[`read${modelName}`]       = read(model, defaultScope)
  actions[`create${modelName}`]     = create(model)
  actions[`update${modelName}`]     = update(model, defaultScope)
  actions[`delete${modelName}`]     = del(model, defaultScope)

  return actions
}

module.exports = builder
