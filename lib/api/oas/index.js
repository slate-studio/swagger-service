'use strict'

const fs = require('fs')
const rootPath = process.cwd()

const swaggerMiddleware = require('swagger-express-mw')
const config            = require('./config')()

module.exports = service => {
  const isEnabled = fs.existsSync(`${rootPath}/api/swagger/swagger.yaml`)

  if (!isEnabled) {
    log.info('No API specification found')

    return Promise.resolve()
  }

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
