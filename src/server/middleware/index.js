'use strict'

const responseTime = require('response-time')
const namespace    = require('./0_namespace')
const logger       = require('./1_logger')
const health       = require('./2_health')
const swagger      = require('./swagger')
const errors       = require('./4_errors')

module.exports = service => {
  service.use(responseTime())
  service.use(namespace)
  service.use(logger)
  service.use('/', health)

  return swagger(service)
    .then(() => service.use(errors))
}
