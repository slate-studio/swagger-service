'use strict'

const rootPath = process.cwd()
const fs       = require('fs')
const plugins  = require('./plugins')

const MODELS_PATH = `${rootPath}/src/models`
const GCN_PATH    = `${MODELS_PATH}/_getCollectionName`

const schemas = {}

global.Schema = ({ model, collection, schema }) => {
  const mongooseSchema = new mongoose.Schema(schema)

  if (Schema.getCollectionName && collection) {
    mongooseSchema.getCollectionName = Schema.getCollectionName(collection)
  }

  mongooseSchema.plugin(plugins.autoIncrement, { model })

  return mongooseSchema
}

const isGetCollectionNameExist = fs.existsSync(GCN_PATH)

if (isGetCollectionNameExist) {
  Schema.getCollectionName = require(GCN_PATH)
}

const isModelsPathExist = fs.existsSync(MODELS_PATH)

if (isModelsPathExist) {
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

exports = module.exports = schemas
