'use strict'

const errors   = require('../../errors')
const rootPath = require('app-root-path')
const fs       = require('fs')
const cls      = require('continuation-local-storage')

const MODELS_PATH = `${rootPath}/src/models`

const schemas = {}
const models  = {}

class CustomRequestNamespace {

  constructor(options) {
    this.namespace = {}

    _.forEach(options, (value, name) => {
      if (_.toLower(name).substr(0, 2) === 'x-') {
        name = _.toLower(name).replace('x-', '')
        name = _.camelCase(name)
      }

      this.set(name, value)
    })
  }

  get(name) {
    return this.namespace[name] || null
  }

  set(key, value) {
    this.namespace[key] = value
  }

}

const isSchemaWithCustomCollection = schema => {
  return _.isFunction(schema.getCustomCollectionName)
}

const Model = (modelName, options = {}) => {
  const schema = schemas[modelName]

  if (!schema) {
    throw new errors.Base(`Schema for '${modelName}' is not found.`)
  }

  if (isSchemaWithCustomCollection(schema)) {
    let namespace = {}

    if (_.isEmpty(options)) {
      namespace = cls.getNamespace('requestNamespace')

    } else {
      namespace = new CustomRequestNamespace(options)

    }

    modelName = schema.getCustomCollectionName(namespace)
  }

  let model = models[modelName]

  if (!model) {
    const collectionName =
      (isSchemaWithCustomCollection(schema) ? modelName : null)

    model = mongoose.model(modelName, schema, collectionName)
    models[modelName] = model
  }

  return model
}

const initializeSchemas = () => {
  const isExistingPath = fs.existsSync(MODELS_PATH)

  if (isExistingPath) {
    const files = fs.readdirSync(MODELS_PATH)

    const sources = _.chain(files)
      .filter(f => _.endsWith(f, '.js'))
      .filter(f => !_.startsWith(f, '_'))
      .filter(f => fs.statSync(`${MODELS_PATH}/${f}`).isFile())
      .map(f    => f.replace('.js', ''))
      .value()

    _.forEach(sources, source => {
      const name   = _.upperFirst(source)
      const schema = require(`${MODELS_PATH}/${source}`)

      schemas[name] = schema
    })
  }
}

exports = module.exports = Model
exports.initializeSchemas = initializeSchemas
