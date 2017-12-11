'use strict'

const pluralize = require('../../../../utils/pluralize')

module.exports = (modelName, id, params) => {
  const pluralName = pluralize(_.kebabCase(modelName))
  const basePath   = _.get(C, 'swagger.basePath', '')

  let path = `${basePath}/${pluralName}`

  if (id) {
    path += `/${id}`
  }

  if (params) {
    path += `?${params}`
  }

  return path
}
