'use strict'

const rootPath = process.cwd()
const fs       = require('fs')
const plugins  = require('./plugins')

const collectionNamePath  = `${rootPath}/src/lib/collectionName.js`
const collectionNameExist = fs.existsSync(collectionNamePath)

let collectionName = null
if (collectionNameExist) {
  collectionName = require(collectionNamePath)
}

global.Schema = ({ model, schema, collection }) => {
  const mongooseSchema = new mongoose.Schema(schema)

  if (collectionName && collection) {
    mongooseSchema.getDynamicCollectionName = collectionName(collection)
  }

  mongooseSchema.plugin(plugins.autoIncrement, { model })

  return mongooseSchema
}

const schemas = {}

const modelsPath = `${rootPath}/src/models`
const isModelsPathExist = fs.existsSync(modelsPath)

if (isModelsPathExist) {
  const files = fs.readdirSync(modelsPath)

  const sources = _.chain(files)
    .filter(f => _.endsWith(f, '.js'))
    .filter(f => !_.startsWith(f, '_'))
    .filter(f => fs.statSync(`${modelsPath}/${f}`).isFile())
    .map(f    => f.replace('.js', ''))
    .value()

  _.forEach(sources, source => {
    const name   = _.upperFirst(source)
    const schema = require(`${modelsPath}/${source}`)

    schemas[name] = schema
  })
}

exports = module.exports = schemas
