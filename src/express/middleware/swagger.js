'use strict'

const swaggerMiddleware = require('swagger-express-mw')
const errors            = require('../../errors')

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

exports = module.exports = (service) => {
  const config = buildConfig()

  return new Promise((resolve, reject) => {
    swaggerMiddleware.create(config, (error, middleware) => {
      if (error) {
        return reject(error)
      }

      middleware.register(service)

      const authenticationToken = (req, spec, authenticationToken, callback) => {
        const getError = error => {
          const error = new errors.Http.Http403()
          error.errors = []
          error.errors.push(error)
          return error
        }
        
        // TODO: Add authentication when requirements are defined.
        if (authenticationToken) {
          const json   = new Buffer(authenticationToken, 'base64').toString()
          const object = JSON.parse(json)

          const operationId           = req.swagger.operation.operationId
          const availableOperationIds = object.operationIds || []

          if (availableOperationIds.indexOf(operationId) === -1) {
            const error = getError(new UnauthorizedOperationError())
            return callback(error)
          }

          const customAuthentication = _.get(C, 'swagger.authentication', null)

          if (!_.isFunction(customAuthentication)) {
            log.warn('[authentication] Has not installed custom authentication function')
            return callback()
          } else {
            return customAuthentication(req, object)
              .then(error => {
                if (error) {
                  return callback(getError(error))
                }

                callback()
              })
          }
        }

        const error = getError(new errors.AuthenticationTokenNotProvided())
        return callback(error)
      }

      middleware.runner.securityHandlers = { authenticationToken }

      return resolve(service)
    })
  })
}

exports.isEnabled = () => {
  return fs.existsSync(`${rootPath}/api/swagger/swagger.yaml`)
}
