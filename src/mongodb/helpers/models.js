'use strict'

const errors         = require('../../errors')
const rootPath       = require('app-root-path')
const fs             = require('fs')
const cls            = require('continuation-local-storage')

const schemas        = {}
const models         = {}
const mockNamespaces = {}

const initialize = () => {
  _initSchemas()
  _initModels()
}

const getInstance = modelName => {
  if (!schemas[modelName]) {
    throw new errors.Base(`Model '${modelName}' is not found`)
  }

  const schema = schemas[modelName]

  if (isSchemaWithCustomCollection(schema)) {
    const namespace = cls.getNamespace('requestNamespace')
    modelName       = schema.getCustomCollectionName(
      _getMockNamespace(modelName) || namespace
    )

    if (!models[modelName]) {
      models[modelName] = mongoose.model(modelName, schema, modelName)
    }
  }

  return models[modelName]
}

const isSchemaWithCustomCollection = schema => {
  return _.isFunction(schema.getCustomCollectionName)
}

const mockNamespace = (modelName, namespace, times) => {
  mockNamespaces[modelName] = {
    namespace:  namespace,
    times:      parseInt(times)
  }
}

const _getMockNamespace = modelName => {
  const mock = mockNamespaces[modelName]

  if (mock && mock.times > 0) {
    mock.times--
    return mock.namespace
  }

  return null
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
      const name          = _.upperFirst(source)
      schemas[name] = require(`${path}/${source}`)
    })

  }
}

module.exports = () => {
  initialize()
  return {
    getInstance,
    isSchemaWithCustomCollection,
    mockNamespace
  }
}