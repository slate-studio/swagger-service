'use strict'

const swaggerMiddleware = require('swagger-express-mw')

const fs       = require('fs')
const yaml     = require('js-yaml')
const rootPath = require('app-root-path')

const buildConfig = () => {
  const path = `${rootPath}/api/swagger/swagger.yaml`
  const spec = yaml.safeLoad(fs.readFileSync(path, 'utf8'))

  spec.host = `${C.service.host}:${C.service.port}`

  const configPath = `${__dirname}/../../../config/swagger.yaml`
  let   config     = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))

  config = config.swagger
  config['appRoot'] = `${rootPath}`
  config['swagger'] = spec

  return config
}

module.exports = (service) => {
  const config = buildConfig()

  return new Promise((resolve, reject) => {
    swaggerMiddleware.create(config, (error, middleware) => {
      if (error) {
        return reject(error)
      }

      middleware.register(service)
      return resolve(service)
    })
  })
}
