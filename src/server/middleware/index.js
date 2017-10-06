'use strict'

const cors         = require('cors')
const responseTime = require('response-time')
const namespace    = require('./0_namespace')
const logger       = require('./1_logger')
const session      = require('./2_session')
const scope        = require('./3_scope')
const health       = require('./4_health')
const swagger      = require('./5_swagger')
const errors       = require('./6_errors')

module.exports = service => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'production') {
      service.use(cors())
    }

    service.use(responseTime())
    service.use(namespace)
    service.use(logger)
    service.use(session)
    service.use(scope)
    service.use('/', health)

    return swagger(service)
      .then(() => service.use(errors))
      .then(() => resolve())
  })
}
