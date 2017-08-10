'use strict'

module.exports = (modelName, id, params) => {
  const model          = Models[modelName]
  const collectionName = _.kebabCase(model.collection.name)

  let path = `/${collectionName}`

  if (id) {
    path += `/${id}`
  }

  if (params) {
    path += `?${params}`
  }

  return path
}
