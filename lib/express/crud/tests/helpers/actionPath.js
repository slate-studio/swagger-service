'use strict'

module.exports = (modelName, id, params) => {
  const modelClass     = Models[modelName]
  const collectionName = _.kebabCase(modelClass.collection.name)

  let path = `/${collectionName}`

  if (id) {
    path += `/${id}`
  }

  if (params) {
    path += `?${params}`
  }

  return path
}
