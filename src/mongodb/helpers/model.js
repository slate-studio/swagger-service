'use strict'

const errors           = require('../../errors')
const rootPath         = require('app-root-path')
const fs               = require('fs')
const RequestNamespace = require('../../utils/requestNamespace')

const MODELS_PATH = `${rootPath}/src/models`

const schemas = {}
const models  = {}

const isSchemaWithCustomCollection = schema => {
  return _.isFunction(schema.getCustomCollectionName)
}

const Model = (modelName, headers) => {
  const schema = schemas[modelName]

  if (!schema) {
    throw new errors.Base(`Schema for '${modelName}' is not found.`)
  }

  if (isSchemaWithCustomCollection(schema)) {
    const requestNamespace = new RequestNamespace(headers)
    modelName = schema.getCustomCollectionName(requestNamespace)
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
