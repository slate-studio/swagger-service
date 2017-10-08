'use strict'

const errors   = require('../errors')
const RequestNamespace = require('../utils/requestNamespace')

class SchemaNotFound extends errors.Base {
  constructor(modelName) {
    super(`Schema for '${modelName}' is not found`)
    this.code = 'SCHEMA_NOT_FOUND'
    this.name = this.constructor.name
  }
}

const isSchemaWithDynamicCollectionName = schema => {
  return _.isFunction(schema.getDynamicCollectionName)
}

exports = module.exports = (schemas={}) => {
  const models = {}

  global.Model = (modelName, customNamespace) => {
    const schema = schemas[modelName]

    if (!schema) {
      throw new SchemaNotFound(modelName)
    }

    if (isSchemaWithDynamicCollectionName(schema)) {
      const requestNamespace = new RequestNamespace(customNamespace)
      modelName = schema.getDynamicCollectionName(modelName, requestNamespace)
    }

    let model = models[modelName]

    if (!model) {
      const collectionName =
        (isSchemaWithDynamicCollectionName(schema) ? modelName : null)

      model = mongoose.model(modelName, schema, collectionName)
      models[modelName] = model
    }

    return model
  }
}
