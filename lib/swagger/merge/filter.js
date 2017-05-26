'use strict'

const buildTags = require('./buildTags')

const DEFINITION_RE = /#\/definitions\/\w+/g

const filterOperations = (spec, operationIds) => {
  _.forEach(spec.paths, methods => {
    _.forEach(methods, (operation, method) => {
      const isNotFound = operationIds.indexOf(operation.operationId) == -1
      if (isNotFound) {
        delete methods[method]
      }
    })
  })
}

const filterPaths = spec => {
  _.forEach(spec.paths, (methods, path) => {
    if (_.isEmpty(methods)) {
      delete spec.paths[path]
    }
  })
}

const parseDefinitionKeys = (object) => {
  let keys = JSON.stringify(object).match(DEFINITION_RE)
  return _.map(keys, k => k.replace('#/definitions/', ''))
}

const parseEmbeddedDefinitionKeys = (definitions, keys) => {
  let result = []

  _.forEach(keys, key => {
    const definition = definitions[key]
    const keys = parseDefinitionKeys(definition)
    result = _.concat(result, keys)
  })

  return _.uniq(result)
}

const filterDefinitions = spec => {
  let pathsDefinitionKeys = []

  _.forEach(spec.paths, methods => {
    _.forEach(methods, operation => {
      const keys = parseDefinitionKeys(operation)
      pathsDefinitionKeys = _.concat(pathsDefinitionKeys, keys)
    })
  })

  let definitionKeys        = _.uniq(pathsDefinitionKeys)
  let definitionKeysToCheck = _.clone(definitionKeys)

  do {
    const embeddedDefinitionKeys = parseEmbeddedDefinitionKeys(spec.definitions, definitionKeysToCheck)

    definitionKeysToCheck = _.difference(embeddedDefinitionKeys, definitionKeys)

    definitionKeys = _.concat(definitionKeys, embeddedDefinitionKeys)
    definitionKeys = _.uniq(definitionKeys)

  } while (definitionKeysToCheck.length > 0)

  const allDefinitionKeys     = _.keys(spec.definitions)
  const privateDefinitionKeys = _.difference(allDefinitionKeys, definitionKeys)

  _.forEach(privateDefinitionKeys, key => {
    delete spec.definitions[key]
  })
}

module.exports = (referenceSpec, operationIds) => {
  const spec = _.cloneDeep(referenceSpec)

  filterOperations(spec, operationIds)
  filterPaths(spec)
  filterDefinitions(spec)

  spec.tags = buildTags(spec)
  return spec
}
