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

const filterAccess = (spec) => {
  if (C.swagger.access) {
    const access   = yamljs.load(C.swagger.access)
    const security = buildSecurity()

    _.forEach(spec.paths, methods => {
      _.forEach(methods, (operation, method) => {
        const accessType = access[operation.operationId]

        if (accessType) {
          if (accessType == 'private') {
            delete methods[method]
          }

          if (accessType == 'secure') {
            operation.security = security
          }

        } else {
          delete methods[method]

        }
      })
    })
  }
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

  if (process.env.NODE_ENV == 'production') {
    spec.host = C.service.host

  } else {
    spec.host = `${C.service.host}:${C.service.port}`

  }

  spec.basePath    = _basePath
  spec.tags        = []
  spec.paths       = {}
  spec.definitions = {}

  const paths = {}
  _.forEach(C.services, service => {
    const name   = service.name
    service.spec = require(`${_rootPath}/${service.spec}`)

    _.forEach(service.spec.paths, (methods, path) => {
      const newPath = `/${name}${path}`
      spec.paths[newPath] = methods
    })

    _.merge(spec.definitions, service.spec.definitions)
  })

  filterAccess(spec)

  filterPaths(spec)
  filterDefinitions(spec)

  spec.tags = buildTags(spec)
  spec.info.version = mergeVersions()

  return spec
}
