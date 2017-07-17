'use strict'

const keepAliveAgent = require('agentkeepalive')
const http           = require('http')
const url            = require('url')

const defaultAgentSettings = {
  maxSockets:                 100,
  maxFreeSockets:             10,
  timeout:                    600000,
  freeSocketKeepAliveTimeout: 300000
}

const agent = new keepAliveAgent(_.assign(
  defaultAgentSettings,
  _.get(C, 'swagger-client.keepAliveAgentSettings', {})
))

const errorMessagesList = {
  '4xx': 'Client Error',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Not Found',
  '5xx': 'Server Error',
  '500': 'Internal Server Error',
  '502': 'Bad Gateway'
}

module.exports = request => {
  return new Promise((resolve, reject) => {

    if (request.requestInterceptor) {
      request = request.requestInterceptor(request)
    }

    const urlFormat = url.format(request.url)
    const options   = url.parse(urlFormat)

    options.method  = request.method
    options.headers = request.headers
    options.agent   = agent

    const req = http.request(options, (response) => {
      let result = ''

      response.on('data', (chunk) => {
        result += chunk
      })

      response.on('end', () => {
        try {
          let obj

          if (result) {
            obj = JSON.parse(result)
          }

          if (parseInt(response.statusCode) >= 400 || _.has(obj, 'error')) {
            throw new Error(_.get(
              obj,
              'error.message',
              _.get(errorMessagesList, response.statusCode, errorMessagesList[`${String(response.statusCode)[0]}xx`])
            ))
          }

          resolve({
            statusCode: response.statusCode,
            statusText: response.statusMessage,
            headers:    response.headers,
            obj:        obj,
            body:       obj,
            text:       result
          })

        } catch (e) {
          reject(e)

        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (request.body) {
      req.write(request.body)
    }

    req.end()
  })
}