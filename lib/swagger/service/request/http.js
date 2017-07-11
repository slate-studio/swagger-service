'use strict'

const keepAliveAgent  = require('agentkeepalive')
const http            = require('http')
const url             = require('url')

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

module.exports = (request) => {
  return new Promise((resolve, reject) => {
    let options      = url.parse( url.format( request.url ) )
    options.method   = request.method
    options.headers  = request.headers
    options.agent    = agent

    const req = http.request(options, (response) => {
      let result = ''

      response.on('data', (chunk) => {
        result += chunk
      })

      response.on('end', () => {
        const obj = JSON.parse(result)
        resolve({
          statusCode:  response.statusCode,
          statusText:  response.statusMessage,
          headers:     response.headers,
          obj:         obj,
          body:        obj,
          text:        result
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })
    if (['POST', 'PUT'].indexOf(request.method) !== -1) {
      req.write(request.body)
    }
    req.end()
  })
}