'use strict'

const SwaggerClient = require('swagger-client')
const faker         = require('faker')
const nock          = require('nock')

const HTTP_SUCCESS_RESPONSES = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content'
}

const fakeObject = (schema) => {
  const result = {}

  _.forEach(schema, (def, name) => {
    let value

    if (def.hasOwnProperty('default')) {
      value = def.default

    } else if (def.hasOwnProperty('format')) {
      switch (def.format) {
        case 'uuid':
          value = faker.random.uuid()
          break

        case 'date-time':
        case 'date':
          value = faker.date.recent()
          break

        default:
          value = faker.lorem.word()
          break
      }
    } else {
      switch (def.type) {
        case 'integer':
          value = faker.random.number()
          break

        case 'boolean':
          value = true
          break

        case 'array':
          value = []
          break

        default:
          value = faker.lorem.word()
          break
      }
    }

    result[name] = value
  })

  return result
}

const findOperation = (spec, operationId) => {
  _.forEach(spec.paths, (methods, path) => {
    _.forEach(methods, (operation, method) => {
      if (operation.operationId == operationId) {
        return operation
      }
    })
  })

  return
}

const successResponseStatus = (responses) => {
  const successCodes = _.keys(HTTP_SUCCESS_RESPONSES)
  const codes = _.keys(responses)

  return _.intersection(successCodes, codes)[0] || 200
}

const defaultSuccessResponseFor = (spec, operationId) => {
  const operation = findOperation(spec, operationId)
  const responses = operation.responses
  const status    = successResponseStatus(responses)
  const schema    = responses[status].definition.properties
  const object    = fakeObject(schema)

  return { status: status, object: object }
}

module.exports = (spec) => {
  const host = `http://${spec.host}`

  return (operationId, params, response = {}) => {
    const request = SwaggerClient.buildRequest({
      spec:        spec,
      operationId: operationId,
      parameters:  params
    })

    const method = request.method.toLowerCase()
    const path   = _.replace(request.url, host, '')

    if (_.isEmpty(response)) {
      response = defaultSuccessResponseFor(spec, operationId)
    }

    return nock(host)[method](path).reply(response.status, response.object)
  }
}
