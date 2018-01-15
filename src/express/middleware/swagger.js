'use strict'

const swaggerMiddleware = require('swagger-express-mw')
const errors            = require('../../errors')

const _        = require('lodash')
const fs       = require('fs')
const yaml     = require('js-yaml')
const rootPath = require('app-root-path')
const yamlPath = `${rootPath}/api/swagger/swagger.yaml`
const jsonPath = `${rootPath}/api/swagger/swagger.json`

const buildSpec = spec => {
  const json = JSON.stringify(spec, null, '  ')
  fs.writeFileSync(jsonPath, json)
}

const buildConfig = () => {
  const spec = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'))

  spec.host = `${C.service.host}:${C.service.port}`

  buildSpec(spec)

  const configPath = `${__dirname}/../../../config/swagger.yaml`
  let   config     = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))

  config = config.swagger
  config['appRoot'] = `${rootPath}`
  config['swagger'] = spec

  return config
}

exports = module.exports = (service) => {
  const config = buildConfig()

  C.swagger = _.assign(C.swagger, { basePath: config.swagger.basePath })
  
  return new Promise((resolve, reject) => {
    swaggerMiddleware.create(config, (error, middleware) => {
      if (error) {
        return reject(error)
      }

      middleware.register(service)

      const authenticationToken = (req, spec, authenticationToken, callback) => {
        if (!req.headers['x-source-operation-id']) {
          const { operationId }                  = req.swagger.operation
          req.headers['x-source-operation-id'] = operationId
          req.requestNamespace.set('sourceOperationId', operationId)
        }

        const Authentication = _.get(C, 'swagger.Authentication', null)

        if (!Authentication) {
          return callback()
        }

        const authentication = new Authentication(authenticationToken, req)
        return authentication.exec(callback)
      }

      middleware.runner.securityHandlers = { authenticationToken }

      return resolve(service)
    })
  })
}

exports.isEnabled = () => {
  return fs.existsSync(`${rootPath}/api/swagger/swagger.yaml`)
}
