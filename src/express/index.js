'use strict'

const fs         = require('fs')
const yaml       = require('js-yaml')
const rootPath   = require('app-root-path')
const cors       = require('cors')
const bodyParser = require('body-parser')
const responses  = require('./responses')

const yamlPath    = `${rootPath}/api/swagger/swagger.yaml`
const exitTimeout = 1000

const connect = (service) => {
  if (C.service.port) {
    const port           = C.service.port
    const Authentication = _.get(C, 'swagger.Authentication', null)
    const bodySizeLimit  = _.get(C, 'service.bodySizeLimit', '10mb')
    const corsConfig     = _.get(C, 'service.cors', {})

    const responseTime = require('response-time')
    const middleware   = require('./middleware')

    if (!Authentication) {
      log.warn('`service.Authentication` class is not defined.')
    }

    service.set('Authentication', Authentication)

    service.use(bodyParser.json( { limit: bodySizeLimit } ))
    service.use(cors(corsConfig))
    service.use(responseTime())
    service.use(middleware.namespace)
    service.use(middleware.timeout)
    service.use(middleware.logger)
    service.use(middleware.session)
    service.use(middleware.scope)

    service.use('/', middleware.health)
    service.use('/swagger', (req, res) => {
      const spec = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'))
      spec.host  = `${C.service.host}:${C.service.port}`
      responses.successResponse(req, res, spec)
    })

    if (!middleware.swagger.isEnabled()) {
      log.info('No API specification found')
      log.info(`Listening on port ${port}`)
      return service.listen(port, callback => service.emit('started', callback))
    }

    return middleware.swagger(service)
      .then(() => {
        service.use(middleware.errors)

        log.info(`Listening on port ${port}`)
        service.listen(port, callback => service.emit('started', callback))
      })
      .catch(error => {
        log.error('SwaggerMiddleware', error)
        setTimeout(() => process.exit(1), exitTimeout)
      })
  }

  return Promise.resolve()
}

exports = module.exports = connect

exports.crud      = require('./crud')
exports.responses = require('./responses')
