'use strict'

const request = require('request')

const response = (res, options, errors) => {
  let status = 'ok'

  if (errors.length > 0) {
    status = 'error'
  }

  return res.status(200).json({
    name:    options.name,
    version: options.version,
    status:  status,
    errors:  errors
  })
}

const validateServiceSchemaVersion = (pkgName, options) => {
  return new Promise((resolve) => {
    const name   = pkgName
    const local  = options.local
    const schema = require(`${_rootPath}/${local}`)
    const uri    = options.swagger

    // TODO: Update global scope for Swagger clients.
    if (!S[options.name].client) {
      return resolve(`${name}: Swagger schema is unreachable`)
    }

    request
      .get(uri, (error, res, body) => {
        if (error) {
          return resolve(error)
        }

        const remoteSchema  = JSON.parse(body)
        const localVersion  = schema.info.version
        const remoteVersion = remoteSchema.info.version

        if (localVersion != remoteVersion) {
          return resolve(`${name}: Service version mismatch, expected: v${localVersion}, returned: v${remoteVersion}`)
        }

        resolve()
      })
  })
}

module.exports = (options) => {
  return (req, res) => {
    let errors  = []
    let counter = 0

    if (options.services) {
      Object.keys(options.services).forEach((pkgName) => {
        validateServiceSchemaVersion(pkgName, options.services[pkgName]).
          then((validationError) => {
            counter += 1

            if (validationError) {
              errors.push(validationError)
            }

            if (Object.keys(options.services).length == counter) {
              response(res, options, errors)
            }

          })
      })

    } else {
      return response(res, options, errors)

    }
  }
}
