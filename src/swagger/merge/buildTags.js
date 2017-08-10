'use strict'

module.exports = (spec) => {
  let tags = []
  _.forEach(spec.paths, (methods) => {
    _.forEach(methods, (operation) => {
      tags = _.concat(tags, operation.tags)
    })
  })

  tags = _.uniq(tags)

  return _.map(tags, tag => { return { name: tag } })
}
