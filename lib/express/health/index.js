'use strict'

const request = require('request-promise-native')

const response = (res, errors) => {
  let status = 'ok'

  if (_.keys(errors).length > 0) {
    status = 'error'
  }

  const response = {
    name:    _serviceName,
    version: _version,
    status:  status,
    errors:  errors
  }

  return res.status(200).json(response)
}

const checkServiceVersion = (name, version, uri, errors) => {
  return request(uri)
    .then(body => {
      const remoteSpec = JSON.parse(body)
      const remoteVersion = remoteSpec.info.version

      if (version != remoteVersion) {
        errors[name] = `Service version mismatch, expected: v${version}, returned: v${remoteVersion}`
      }

      return errors
    })
    .catch(error => {
      errors[name] = error

      return errors
    })
}

module.exports = (req, res) => {
  const errors  = {}

  if (C.services) {
    let chain = Promise.resolve(errors)

    _.forEach(C.services, (config) => {
      const spec       = require(`${_rootPath}/${config.spec}`)
      const name       = config.name
      const version    = spec.info.version
      const basePath   = spec.basePath
      const path       = _.keys(spec.paths).filter((k) => _.endsWith(k, '/swagger'))[0]
      const normalized = `${config.host}${basePath}${path}`.replace('//', '/')
      const uri        = `http://${normalized}`

      chain = chain.then((errors) => checkServiceVersion(name, version, uri, errors))
    })

    chain.then((errors) => { response(res, errors) })

  } else {
    return response(res, errors)

  }
}
