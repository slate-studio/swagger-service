'use strict'

// USAGE: MODEL=StaffProfile TAG=StaffProfiles node ./api/swagger/bin/generate.js
// TODO: Review this script.

const _        = require('lodash')
const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

global.C = require('config')
const uri = C.mongodb.uri
const connection = mongoose.connect(uri).connection
autoIncrement.initialize(connection)

const modelName = process.env.MODEL
const tag       = process.env.TAG

const yaml = require('js-yaml')
const fs   = require('fs')

const restrictedFields = [
  '_id',
  'integerId',
  '__v',
  '_deleted',
  'updatedAt',
  'createdAt'
]

// TODO: This has to be updated, would not work. Don't need model here, only
//       schema.
// const models = require('../../../src/models')
// const schema = models()(modelName).schema

const tagPath = `./api/swagger/src/${tag}`
const definitionsPath = `${tagPath}/definitions`
if (!fs.existsSync(tagPath)){
    fs.mkdirSync(tagPath)
}
if (!fs.existsSync(definitionsPath)){
    fs.mkdirSync(definitionsPath)
}

// Paths
const collection = _.lowerFirst(tag)

const path       = _.kebabCase(tag)
const controller = `${collection}Controller`
const instance   = _.lowerFirst(modelName)

const indexOperationId   = `index${tag}`
const createOperationId  = `create${modelName}`
const showOperationId    = `show${modelName}ById`
const updateOperationId  = `update${modelName}`
const destroyOperationId = `destroy${modelName}`

const templatesPath       = './api/swagger/templates/Tag'

const indexTemplatePath   = `${templatesPath}/indexTags.yaml`
const createTemplatePath  = `${templatesPath}/createTag.yaml`
const showTemplatePath    = `${templatesPath}/showTagById.yaml`
const updateTemplatePath  = `${templatesPath}/updateTag.yaml`
const destroyTemplatePath = `${templatesPath}/destroyTag.yaml`

const createAction = (templatePath, operationId) => {
  fs.readFile(templatePath, 'utf8', (err, data) => {
    const result = data.replace(/\%PATH\%/g, path)
                       .replace(/\%CONTROLLER\%/g, controller)
                       .replace(/\%TAG\%/g, tag)
                       .replace(/\%OPERATION\%/g, operationId)
                       .replace(/\%MODEL\%/g, modelName)
                       .replace(/\%INSTANCE\%/g, instance)

    fs.writeFileSync(`${tagPath}/${operationId}.yaml`, result )
  })
}

createAction(indexTemplatePath, indexOperationId)
createAction(createTemplatePath, createOperationId)
createAction(showTemplatePath, showOperationId)
createAction(updateTemplatePath, updateOperationId)
createAction(destroyTemplatePath, destroyOperationId)

// Definitions
const createDefinitionYaml = (name, properties) => {
  const definition = {}
  definition[name] = {
    properties: properties
  }
  yamlData = yaml.dump(definition)
  fs.writeFileSync(`${definitionsPath}/${name}.yaml`, yamlData )

}

const buildEmbeddedDocumentName = (modelName, path) => {
  var embededModelName = `${modelName}${_.upperFirst(path)}`
  // TODO: make singular here right way
  embededModelName = _.trimEnd(embededModelName, 's')
  return embededModelName
}

const buildDefinitionProperties = (schema) => {

  var embededDocument = {}
  const properties = {}
  schema.eachPath( (path) => {
    const fieldSchema = schema.paths[path]
    const fieldType = fieldSchema.instance
    const enumOptions = fieldSchema.enumValues
    const defaultValue = fieldSchema.options.default

    var params = {}
    switch (fieldType) {
      case 'Array':
        embededDocument = fieldSchema.schema
        params = {
          type: 'array',
          items: {
            type: 'string'
          }
        }
        if (embededDocument) {
          params.items = {}
          const embededModelName = buildEmbeddedDocumentName (modelName, path)
          params.items.$ref = `#/definitions/${embededModelName}`

          const embededDocumentProperties = buildDefinitionProperties(embededDocument)
          createDefinitionYaml(embededModelName, embededDocumentProperties)
        }
        break
      case 'Embedded':
        embededDocument = fieldSchema.schema
        params = {
          type: 'object',
        }
        if (embededDocument) {
          params = {}
          const embededModelName = buildEmbeddedDocumentName (modelName, path)
          params.$ref = `#/definitions/${embededModelName}`

          const embededDocumentProperties = buildDefinitionProperties(embededDocument)
          createDefinitionYaml(embededModelName, embededDocumentProperties)
        }
        break
      case 'Mixed':
        params = {
          type: 'object',
        }
        break
      case 'Date':
        params = {
          type: 'string',
          format: 'date-time'
        }
        break
      case 'Boolean':
        params = {
          type: 'boolean',
        }
        break
      case 'ObjectID':
        params = {
          type: 'string',
          format: 'uuid'
        }
        break
      case 'Number':
        params = {
          type: 'number',
        }
        break
      default:
        params = {
          type: 'string'
        }
    }

    if (defaultValue || defaultValue == false) {
      params.default = defaultValue
    }

    if (enumOptions && enumOptions.length > 0 ) {
      params.enum = enumOptions
    }

    properties[path] = params

  })

  return properties
}

const properties = buildDefinitionProperties(schema)

let inputProperties = _.omit(properties, restrictedFields)
inputProperties = _.forOwn(inputProperties, (value, key) => {
  value.description = _.startCase(key)
})

createDefinitionYaml(modelName, properties)
createDefinitionYaml(`${modelName}Input`, inputProperties)

mongoose.connection.close()
