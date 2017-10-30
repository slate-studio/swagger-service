'use strict'

const base64       = require('./base64')
const getNamespace = require('continuation-local-storage').getNamespace

class RequestNamespace {

  constructor(headers) {
    const authenticationToken = _
      .get(headers, 'x-authentication-token', null)

    if (authenticationToken) {
      this.namespace = {
        get: function (name) {
          return this[name] || null
        },
        set: function (name, value) {
          this[name] = value
          return this
        }
      }

      const requestNamespaceAttributeNames = _
        .get(C, 'service.requestNamespace', [])

      const authenticationTokenJSON = base64.decode(authenticationToken)
      const requestNamespace        = JSON.parse(authenticationTokenJSON)

      this.namespace.authenticationToken = authenticationToken

      _.forEach(requestNamespaceAttributeNames, name => {
        const value = requestNamespace[name] || null
        this.namespace[name] = value
      })

    } else {
      this.namespace = getNamespace('requestNamespace')
    }

  }

  save(emitters, callback) {
    const clsNamespace = getNamespace('requestNamespace')

    if (!_.isEmpty(emitters)) {
      _.forEach(emitters, emitter => {
        clsNamespace.bindEmitter(emitter)
      })
    }

    clsNamespace.run(() => {
      _.forEach(this.namespace, (value, name) => {
        if (!_.isFunction(value)) {
          clsNamespace.set(name, value)
        }
      })

      callback()
    })
  }

  get(name) {
    return this.namespace.get(name)
  }

  set(name, value) {
    return this.namespace.set(name, value)
  }
}

module.exports = RequestNamespace
