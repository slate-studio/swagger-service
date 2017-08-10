'use strict'

const router    = require('express').Router()
const cors      = require('cors')
const rootPath  = require('app-root-path')
const pkg       = require(`${rootPath}/package.json`)
const version   = pkg.version
const responses = require('../responses')
const request   = require('../../utils').request
const path      = '/health'

const checkService = config => {
  const spec     = require(`${rootPath}/${config.spec}`)
  const name     = config.name
  const version  = spec.info.version

  const [hostname, port] = config.host.split(':')

  const options = {
    hostname: hostname,
    port:     parseInt(port),
    path:     '/swagger',
    method:   'GET'
  }

  return request(options)
    .then(res => {
      const remoteVersion = res.object.info.version

      if (version != remoteVersion) {
        const message = `Specification version mismatch, expected: v${version}, \
                         returned: v${remoteVersion}`

        return { name: name, message: message }

      }

      return null
    })
    .catch(error => {
      return { name: name, message: error.message }
    })
}

const health = (req, res) => {
  const response = {
    name:    C.service.name,
    version: version,
    status:  'OK',
    errors:  []
  }

  if (C.services) {
    const checks = _.map(C.services, checkService)

    return Promise.all(checks)
      .then(results => {
        response.errors = _.compact(results)

        if (response.errors.length > 0 ) {
          response.status = 'ERROR'
        }

        responses.successResponse(req, res, response)
      })
      .catch(error => {
        response.status = 'ERROR'
        response.errors = [ { code: error.code, message: error.message } ]

        responses.successResponse(req, res, response)
      })

  } else {
    return responses.successResponse(req, res, response)

  }
}

if (process.env.NODE_ENV == 'production') {
  router.get(path, health)

} else {
  router.get(path, cors(), health)

}

module.exports = router
