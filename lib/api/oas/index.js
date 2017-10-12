'use strict'

const fs   = require('fs')
const yaml = require('js-yaml')

const rootPath = process.cwd()
const yamlPath = `${rootPath}/api/swagger.yaml`
const jsonPath = `${rootPath}/api/swagger.json`

const buildSpec = () => {
  const spec = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'))
  spec.host  = `${C.service.host}:${C.service.port}`

  const json = JSON.stringify(spec, null, '  ')
  fs.writeFileSync(jsonPath, json)

  return spec
}

module.exports = server => {
  const isEnabled = fs.existsSync(yamlPath)

  if (!isEnabled) {
    log.info(`[api] No specification found at ${yamlPath}`)

    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const swaggerMiddleware = require('swagger-express-mw')

    const spec       = buildSpec()
    const configPath = `${__dirname}/config.yaml`
    let   config     = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))

    config = config.swagger
    config.appRoot      = `${rootPath}`
    config.swagger      = spec
    config.fittingsDirs = [ __dirname ]

    swaggerMiddleware.create(config, (error, middleware) => {
      if (error) {
        return reject(error)
      }

      middleware.register(server)

      return resolve(server)
    })
  })
}
