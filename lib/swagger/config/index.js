'use strict'

const fs   = require('fs')
const yaml = require('js-yaml')

const swaggerPath = `${_rootPath}/api/swagger/swagger.yaml`
const swaggerYaml = fs.readFileSync(swaggerPath, 'utf8')
const swaggerSpec = yaml.safeLoad(swaggerYaml)
swaggerSpec.host  = `${C.service.host}:${C.service.port}`

const swaggerConfigPath = `${__dirname}/config.yaml`
const swaggerConfigYaml = fs.readFileSync(swaggerConfigPath, 'utf8')
const swaggerConfig     = yaml.safeLoad(swaggerConfigYaml)

const config = swaggerConfig.swagger
config['appRoot'] = `${_rootPath}`
config['swagger'] = swaggerSpec

module.exports = config
