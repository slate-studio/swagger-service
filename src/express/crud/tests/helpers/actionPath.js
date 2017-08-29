'use strict'

const pluralize = require('../../../../utils/pluralize')

module.exports = (modelName, id, params) => {
  const pluralName = pluralize(_.kebabCase(modelName))

  let path = `/${pluralName}`

  if (id) {
    path += `/${id}`
  }

  if (params) {
    path += `?${params}`
  }

  return path
}
