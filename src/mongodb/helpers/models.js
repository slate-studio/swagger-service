'use strict'

module.exports = () => {
  const rootPath = require('app-root-path')
  const fs       = require('fs')
  const path     = `${rootPath}/src/models`

  const models         = {}
  const isExistingPath = fs.existsSync(path)

  if (isExistingPath) {
    const files = fs.readdirSync(path)

    const sources = _.chain(files)
      .filter(f => _.endsWith(f, '.js'))
      .filter(f => !_.startsWith(f, '_'))
      .filter(f => fs.statSync(`${path}/${f}`).isFile())
      .map(f => f.replace('.js', ''))
      .value()

    _.forEach(sources, (source) => {
      const name  = _.upperFirst(source)
      const model = mongoose.model(name, require(`${path}/${source}`))

      models[name] = model
    })
  }

  return models
}
