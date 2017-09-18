'use strict'

const utils         = require('../../utils')
const getNamespace  = require('continuation-local-storage').getNamespace

module.exports = (req, res, next) => {
  req.requestNamespace = new RequestNamespace(req.headers)
  req.requestNamespace.save()
    .then(next)

  const cslNamespace = getNamespace('requestNamespace')

  cslNamespace.bindEmitter(req)
  cslNamespace.bindEmitter(res)

  cslNamespace.run(() => {
    const requestNamespaceAttributeNames = _
      .get(C, 'service.requestNamespace', [])

    const authenticationToken = _
      .get(req, 'headers.x-authentication-token', null)

    if (authenticationToken) {
      const authenticationTokenJSON = utils.base64.decode(authenticationToken)
      const requestNamespace        = JSON.parse(authenticationTokenJSON)

      req.requestNamespace = requestNamespace

      cslNamespace.set('authenticationToken', authenticationToken)

      _.forEach(requestNamespaceAttributeNames, name => {
        const value = requestNamespace[name] || null
        cslNamespace.set(name, value)
      })
    }

    return next()
  })
}
