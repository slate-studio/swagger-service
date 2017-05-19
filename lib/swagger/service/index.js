'use strict'

const nock          = require('nock')
const SwaggerClient = require('swagger-client')
const mock          = require('./mock')

const IS_TEST_ENVIRONMENT = [ 'test', 'gitlab' ].indexOf(process.env.NODE_ENV) > -1
const CONNECTION_ERRORS   = [ 'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED' ]

const isConnectionError = code => CONNECTION_ERRORS.indexOf(code) > -1
const requestTimeout    = () => IS_TEST_ENVIRONMENT ? 0.1 : 2

module.exports = function(name, spec) {
  this.client = null

  SwaggerClient({ spec: spec })
    .then(client => { this.client = client })

  const request = (...args) => {
    const operationId = args[0]
    const parameters  = args[1]
    const resolve     = args[2]
    const reject      = args[3]

    this.client.execute({ operationId: operationId, parameters: parameters })
      .then(resolve)
      .catch((err) => {
        const errCode = err.code

        if (isConnectionError(errCode)) {
          const timeout = requestTimeout()

          log.error(`Service.${name}.${operationId}`, parameters, errCode)
          log.info(`Retry Service.${name}.${operationId} in ${timeout}s`)

          return setTimeout(() => { request(...args) }, timeout * 1000)

        }

        log.error(err)
        reject(err)
      })
  }

  this.execute = (operationId, params={}) => {
    log.info(`Services.${name}.${operationId}`, params)

    return new Promise((resolve, reject) => request(operationId, params, resolve, reject))
  }

  _.forEach(spec.paths, (methods, path) => {
    _.forEach(methods, (operation, method) => {
      const operationId = operation.operationId

      this[operationId] = (params={}) => {
        log.info(`Services.${name}.${operationId}`, params)

        return new Promise((resolve, reject) => {
          const onSuccess = (success) => resolve(success.obj)
          request(operationId, params, onSuccess, reject)
        })
      }
    })
  })
}
