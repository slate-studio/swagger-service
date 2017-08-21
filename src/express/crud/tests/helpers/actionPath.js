'use strict'

const pluralize = require('../../../../utils/pluralize')

module.exports = (modelName, id, params) => {
  const collectionName = pluralize(_.kebabCase(modelName))

  let path = `/${collectionName}`

  if (id) {
    path += `/${id}`
  }

  if (params) {
    path += `?${params}`
  }

  return path
}
