'use strict'

const router      = require('express').Router()
const cors        = require('cors')
const rootPath    = require('app-root-path')
const serviceSpec = require(`${rootPath}/api/swagger/swagger.json`)
const pkg         = require(`${rootPath}/package.json`)
const version     = pkg.version
const responses   = require('../responses')
const request     = require('../../utils').request
const path        = '/health'

const HEALTH_REQUEST_TIMEOUT = 1000

const checkService = config => {
  const spec              = require(`${rootPath}/${config.spec}`)
  const name              = config.name
  const localVersion      = spec.info.version
  const localVersionMajor = localVersion.split('.')[0]

  const [hostname, port] = config.host.split(':')

  const options = {
    hostname: hostname,
    port:     parseInt(port),
    path:     '/health',
    method:   'GET',
    timeout:  HEALTH_REQUEST_TIMEOUT
  }

  return request(options)
    .then(res => {
      const remoteVersion      = res.object.apiVersion
      const remoteVersionMajor = remoteVersion.split('.')[0]

      if (localVersionMajor !== remoteVersionMajor) {
        const message = `Specification mismatch, expected: v${localVersion}, \
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
  const checkDependencies = (req.query.checkDependencies === 'true') ? true : false

  const response = {
    name:       C.service.name,
    version:    version,
    apiVersion: serviceSpec.info.version,
    status:     'OK',
    errors:     []
  }

  if (checkDependencies && C.services) {
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
