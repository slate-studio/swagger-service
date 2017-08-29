'use strict'

const getNamespace = require('continuation-local-storage').getNamespace

module.exports = (req, res, next) => {
  const namespace = getNamespace('requestNamespace')

  namespace.bindEmitter(req)
  namespace.bindEmitter(res)

  namespace.run(() => {
    const headers = _.get(C, 'service.requestNamespace.headers')

    _.forEach(headers, headerName => {
      const value = req.headers[headerName] || null

      if (_.toLower(headerName).substr(0, 2) === 'x-') {
        headerName = _.toLower(headerName).replace('x-', '')
        headerName = _.camelCase(headerName)
      }

      namespace.set(headerName, value)
    })

    next()
  })
}
