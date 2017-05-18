'use strict'

const nock          = require('nock')
const SwaggerClient = require('swagger-client')
const mock          = require('./mock')

const IS_TEST_ENVIRONMENT = [ 'test', 'gitlab' ].indexOf(process.env.NODE_ENV) > -1
const CONNECTION_ERRORS = [ 'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED' ]

const isConnectionError = code => CONNECTION_ERRORS.indexOf(code) > -1
const connectionTimeout = () => IS_TEST_ENVIRONMENT ? 0.01 : 2
const requestTimeout = () => IS_TEST_ENVIRONMENT ? 0.1 : 2

module.exports = function(name, url, filename) {
  let client = false

  const onSwaggerError = err => {
    const timeout = connectionTimeout()
    log.error(`Services.${name} connection error`, err)
    log.info(`Retry connecting Service.${name} in ${timeout}s`)

    setTimeout(buildSwaggerClient, timeout * 1000)
  }

  const buildSwaggerClient = () => {
    SwaggerClient(url)
      .then(swaggerClient => {
        client = swaggerClient
        log.info(`Services.${name} connected`)
      })
      .catch(onSwaggerError)
  }

  this.initialize = () => {
    log.info(`Connecting Services.${name}: ${url}`)
    buildSwaggerClient()
  }

  const request = (...args) => {
    const operationId = args[0]
    const parameters  = args[1]
    const onSuccess   = args[2]
    const onError     = args[3]

    client.execute({ operationId: operationId, parameters: parameters })
      .then(onSuccess)
      .catch((err) => {
        const errCode = err.code

        if (isConnectionError(errCode)) {
          const timeout = requestTimeout()

          log.error(`Service.${name}.${operationId}`, parameters, errCode)
          log.info(`Retry Service.${name}.${operationId} in ${timeout}s`)

          return setTimeout(() => { request(...args) }, timeout * 1000)

        }

        log.error(err)
        onError(err)
      })
  }

  const initializeRequest = (...args) => {
    if (client) {
      request(...args)

    } else {
      const timeout = connectionTimeout()
      log.error(`Service.${name} is not connected, retry in ${timeout}s`)

      setTimeout(() => { initializeRequest(...args) }, timeout * 1000)

    }
  }

  this.execute = (operationId, params) => {
    log.info(`Services.${name}.${operationId}`, params)

    return new Promise((resolve, reject) => {
      initializeRequest(operationId, params, resolve, reject)
    })
  }

  if (IS_TEST_ENVIRONMENT) {
    const spec = require(`${_rootPath}/${filename}`)
    const host = `http://${spec.host}`
    const path = _.replace(url, host, '')

    this.mock = mock(spec)

    nock(host).get(path).reply(200, spec)
  }
}
