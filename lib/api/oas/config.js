'use strict'

const fs   = require('fs')
const yaml = require('js-yaml')

const authenticationToken = require('./authenticationToken')

const rootPath = process.cwd()

module.exports = () => {
  const path = `${rootPath}/api/swagger/swagger.yaml`
  const spec = yaml.safeLoad(fs.readFileSync(path, 'utf8'))

  spec.host = `${C.service.host}:${C.service.port}`

  const configPath = `${__dirname}/config.yaml`
  let   config     = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))

  config = config.swagger
  config['appRoot'] = `${rootPath}`
  config['swagger'] = spec

  config.securityHandlers = { authenticationToken }
  config.fittingsDirs = [ __dirname ]

  return config
}
