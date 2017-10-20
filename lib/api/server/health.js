'use strict'

const _ = require('lodash')

const router  = require('express').Router()
const cors    = require('cors')
const request = require('../../request')

const rootPath = process.cwd()
const pkg      = require(`${rootPath}/package.json`)
const version  = pkg.version
const path     = '/health'

const checkService = config => {
  const spec              = require(`${rootPath}/${config.spec}`)
  const name              = config.name
  const localVersion      = spec.info.version
  const localVersionMajor = localVersion.split('.')[0]

  const [hostname, port] = config.host.split(':')

  const options = {
    hostname: hostname,
    port:     parseInt(port),
    path:     '/swagger',
    method:   'GET'
  }

  return request(options)
    .then(res => {
      const remoteVersion      = res.object.info.version
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

        res.status(200).json(response)
      })
      .catch(error => {
        response.status = 'ERROR'
        response.errors = [ { code: error.code, message: error.message } ]

        res.status(200).json(response)
      })

  } else {
    return res.status(200).json(response)

  }
}

if (process.env.NODE_ENV == 'production') {
  router.get(path, health)

} else {
  router.get(path, cors(), health)

}

module.exports = router
