'use strict'

const buildTags = require('./buildTags')

const mergeVersions = () => {
  const numbers =
    _.map(C.services, s => require(`${_rootPath}/${s.spec}`).info
                                                            .version
                                                            .split('.')
                                                            .map(n => parseInt(n)))

  let v = _.zip(...numbers)
  v = _.map(v, numbers => _.sum(numbers))

  return v.join('.')
}

module.exports = () => {
  const spec = _.extend({}, C.swagger.spec)

  spec.tags        = []
  spec.paths       = {}
  spec.definitions = {}

  const paths = {}
  _.forEach(C.services, service => {
    const name  = service.name
    const sspec = _.cloneDeep(require(`${_rootPath}/${service.spec}`))

    _.forEach(sspec.paths, (methods, path) => {
      const newPath = `/${name}${path}`
      spec.paths[newPath] = methods
    })

    _.merge(spec.definitions, sspec.definitions)
  })

  spec.tags = buildTags(spec)
  spec.info.version = mergeVersions()

  return spec
}
