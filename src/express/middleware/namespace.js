'use strict'

const requestNamespaceUtility = require('../../utils/requestNamespace')
const getNamespace            = require('continuation-local-storage').getNamespace

module.exports = (req, res, next) => {
  requestNamespaceUtility.initializeRequestNamespace(req.headers, {req, res}, () => {
    req.requestNamespace = requestNamespaceUtility.getRequestNamespace()
    next()
  })
}
