'use strict'

const errors        = require('../../errors')
const rootPath      = require('app-root-path')
const fs            = require('fs')
const cls           = require('continuation-local-storage')
//const errorHandler  = require('../plugins/customCollectionErrorHandler')

const schemas        = {}
const models         = {}

class CustomRequestNamespace {

  constructor(options) {
    this.context = {}

    _.forEach(options, (value, name) => {

      if (name.substr(0, 2) === 'x-') {
        name = name.replace('x-', '')
      }

      name = _.camelCase(name)

      this.set(name, value)

    })
  }

  get(name) {
    return this.context[name] || null
  }

  set(key, value) {
    this.context[key] = value
  }
}

const isSchemaWithCustomCollection = schema => {
  return _.isFunction(schema.getCustomCollectionName)
}

const model = (modelName, options = {}) => {
  if (!schemas[modelName]) {
    throw new errors.Base(`Schema '${modelName}' is not found`)
  }

  const schema = schemas[modelName]

  if (isSchemaWithCustomCollection(schema)) {

    let namespace = {}

    if (!Object.keys(options).length) {
      namespace = cls.getNamespace('requestNamespace')
    } else {
      namespace = new CustomRequestNamespace(options)
    }

    modelName = schema.getCustomCollectionName(namespace)
  }

  if (!models[modelName]) {
    const model = mongoose.model(
      modelName,
      schema,
      (isSchemaWithCustomCollection(schema) ? modelName : null)
    )
    models[modelName] = model
  }

  return models[modelName]
}

exports = module.exports = () => {
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
      const schema  = require(`${path}/${source}`)
      if (isSchemaWithCustomCollection(schema)) {
        //schema.plugin(errorHandler)
      }
      schemas[name] = schema
    })

  }

  return model
}
