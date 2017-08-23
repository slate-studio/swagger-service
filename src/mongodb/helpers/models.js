'use strict'

const errors         = require('../../errors')
const rootPath       = require('app-root-path')
const fs             = require('fs')
const cls            = require('continuation-local-storage')

const schemas        = {}
const models         = {}

const initialize = () => {
  _initSchemas()
  _initModels()
}

const getModel = (modelName, namespace = null) => {
  if (!schemas[modelName]) {
    throw new errors.Base(`Model '${modelName}' is not found`)
  }

  const schema = schemas[modelName]

  if (isSchemaWithCustomCollection(schema)) {
    if (!namespace) {
      namespace = cls.getNamespace('requestNamespace')
    }

    modelName = schema.getCustomCollectionName(namespace)

    if (!models[modelName]) {
      models[modelName] = mongoose.model(modelName, schema, modelName)
    }
  }

  return models[modelName]
}

const isSchemaWithCustomCollection = schema => {
  return _.isFunction(schema.getCustomCollectionName)
}

const _initModels = () => {
  _.forEach(schemas, (schema, name) => {
    if (!isSchemaWithCustomCollection(schema)) {
      models[name]    = mongoose.model(name, schema)
    }
  })
}

const _initSchemas = () => {
  const path           = `${rootPath}/src/models`
  const isExistingPath = fs.existsSync(path)

  if (isExistingPath) {
    const files = fs.readdirSync(path)

    const sources = _.chain(files)
      .filter(f => _.endsWith(f, '.js'))
      .filter(f => !_.startsWith(f, '_'))
      .filter(f => fs.statSync(`${path}/${f}`).isFile())
      .map(f => f.replace('.js', ''))
      .value()

    _.forEach(sources, source => {
      const name    = _.upperFirst(source)
      schemas[name] = require(`${path}/${source}`)
    })

  }
}

module.exports = () => {
  initialize()
  return getModel
}