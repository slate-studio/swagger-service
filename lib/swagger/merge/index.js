'use strict'

const yamljs = require('yamljs')

const DEFINITION_RE = /#\/definitions\/\w+/g

const mergeVersions = () => {
  const numbers =
    _.map(C.services, s => s.spec.info.version.split('.').map(n => parseInt(n)))

  let v = _.zip(...numbers)
  v = _.map(v, numbers => _.sum(numbers))

  return v.join('.')
}

const buildSecurity = () => {
  return _.map(C.swagger.spec.securityDefinitions, (config, key) => {
    const def = {} ; def[key] = [] ; return def
  })
}

const applyPermissions = (spec) => {
  const permissions = yamljs.load(C.swagger.permissions)
  const security    = buildSecurity()

  _.forEach(spec.paths, methods => {
    _.forEach(methods, (operation, method) => {
      const config = permissions[operation.operationId]

      if (config) {
        if (config.type == 'private') {
          delete methods[method]
        }

        if (config.type == 'secure') {
          operation.security = security
        }

      } else {
        delete methods[method]

      }
    })
  })
}

const filterPaths = (spec) => {
  _.forEach(spec.paths, (methods, path) => {
    if (_.isEmpty(methods)) {
      delete spec.paths[path]
    }
  })
}

const parseDefinitionKeys = (object) => {
  let keys = JSON.stringify(object).match(DEFINITION_RE)
  return _.map(keys, (k) => k.replace('#/definitions/', ''))
}

const parseEmbeddedDefinitionKeys = (definitions, keys) => {
  let result = []

  _.forEach(keys, (key) => {
    const definition = definitions[key]
    const keys = parseDefinitionKeys(definition)
    result = _.concat(result, keys)
  })

  return _.uniq(result)
}

const filterDefinitions = (spec) => {
  let pathsDefinitionKeys = []

  _.forEach(spec.paths, (methods) => {
    _.forEach(methods, (operation) => {
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

  _.forEach(privateDefinitionKeys, (key) => {
    delete spec.definitions[key]
  })
}

const buildTags = (spec) => {
  let tags = []
  _.forEach(spec.paths, (methods) => {
    _.forEach(methods, (operation) => {
      tags = _.concat(tags, operation.tags)
    })
  })

  tags = _.uniq(tags)

  return _.map(tags, tag => { return { name: tag } })
}

module.exports = () => {
  const spec = _.extend({}, C.swagger.spec)

  spec.host        = `${C.service.host}:${C.service.port}`
  spec.tags        = []
  spec.paths       = {}
  spec.definitions = {}

  _.forEach(C.services, service => {
    service.spec = require(`${_rootPath}/${service.spec}`)

    _.merge(spec.paths, service.spec.paths)
    _.merge(spec.definitions, service.spec.definitions)
  })

  applyPermissions(spec)

  filterPaths(spec)
  filterDefinitions(spec)

  spec.tags = buildTags(spec)
  spec.info.version = mergeVersions()

  return spec
}
