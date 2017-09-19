'use strict'

const base64       = require('./base64')
const getNamespace = require('continuation-local-storage').getNamespace

class RequestNamespace {

  constructor(params, clsNamespace) {
    this.namespace = {}

    _.forEach(params, (value, name) => {
      this.set(name, value)
    })

    this.clsNamespace = clsNamespace
  }

  get(name) {
    if (this.clsNamespace) {
      return this.clsNamespace.get(name)
    }

    return this.namespace[name] || null
  }

  set(key, value) {
    if (this.clsNamespace) {
      return this.clsNamespace.set(name, value)
    }

    this.namespace[key] = value
  }

}

const initializeRequestNamespace = (headers, emitters, callback) => {
  const params       = parseHeaders(headers)
  const clsNamespace = getNamespace('requestNamespace')

  if (!_.isEmpty(emitters)) {
    _.forEach(emitters, emitter => {
      clsNamespace.bindEmitter(emitter)
    })
  }

  clsNamespace.run(() => {
    _.forEach(params, (value, name) => {
      clsNamespace.set(name, value)
    })

    callback()
  })
}

const getRequestNamespace = headers => {
  const params = parseHeaders(headers)

  if (!_.isEmpty(params)) {
    return new RequestNamespace(params)
  }

  return new RequestNamespace(params, getNamespace('requestNamespace'))
}

const parseHeaders = headers => {
  const authenticationToken = _
    .get(headers, 'x-authentication-token', null)

  const params = {}

  if (authenticationToken) {
    const requestNamespaceAttributeNames = _
      .get(C, 'service.requestNamespace', [])

    const authenticationTokenJSON = base64.decode(authenticationToken)
    const requestNamespace        = JSON.parse(authenticationTokenJSON)

    params.authenticationToken = authenticationToken

    _.forEach(requestNamespaceAttributeNames, name => {
      const value = requestNamespace[name] || null
      params[name] = value
    })
  }

  return params
}

module.exports = {
  initializeRequestNamespace,
  getRequestNamespace
}
