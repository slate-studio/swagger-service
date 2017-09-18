'use strict'

const utils         = require('../../utils')
const getNamespace  = require('continuation-local-storage').getNamespace

module.exports = (req, res, next) => {
  const namespace = getNamespace('requestNamespace')

  namespace.bindEmitter(req)
  namespace.bindEmitter(res)

  namespace.run(() => {
    const availableParams 
      = _.get(C, 'service.requestNamespace.params', [])

    const tokenBase64
      = _.get(req, 'headers.x-authentication-token', null)

    if (tokenBase64) {
      const authenticationParams = JSON.parse(
        utils.base64.decode(tokenBase64)
      )

      req.requestNamespace = authenticationParams

      namespace.set('authenticationToken', tokenBase64)

      _.forEach(availableParams, name => {
        const value = authenticationParams[name] || null

        namespace.set(name, value)
      })
    }

    next()
  })
}
