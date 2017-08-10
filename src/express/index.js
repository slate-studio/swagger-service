'use strict'

const connect = (service) => {
  if (C.service.port) {
    const port = C.service.port

    const responseTime = require('response-time')
    const middleware   = require('./middleware')

    service.use(responseTime())
    service.use(middleware.namespace)
    service.use(middleware.logger)
    service.use(middleware.session)
    service.use(middleware.scope)
    service.use('/', middleware.health)

    return middleware.swagger(service)
      .then(() => {
        service.use(middleware.errors)

        log.info(`Listening on port ${port}`)
        service.listen(port, callback => service.emit('started', callback))
      })
      .catch(error => {
        log.error('SwaggerMiddleware', error)
        process.exit(1)
      })
  }

  return Promise.resolve()
}

exports = module.exports = connect

exports.crud      = require('./crud')
exports.responses = require('./responses')
