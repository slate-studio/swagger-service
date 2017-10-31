'use strict'

const _ = require('lodash')

const base64       = require('./base64')
const getNamespace = require('continuation-local-storage').getNamespace

class RequestNamespace {

  constructor(headers) {
    const authenticationToken = _
      .get(headers, 'x-authentication-token', null)

    const requestId = _
      .get(headers, 'x-request-id', null)

    if (authenticationToken || requestId) {
      this.namespace = {
        get: function (name) {
          return this[name] || null
        }
      }

      if (requestId) {
        this.namespace.requestId = requestId
      }

      if (authenticationToken) {
        const authenticationTokenJSON = base64.decode(authenticationToken)
        const requestNamespace        = JSON.parse(authenticationTokenJSON)

        this.namespace.authenticationToken = authenticationToken

        _.forEach(requestNamespace, (value, name) => {
          this.namespace[name] = value
        })
      }

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
}

module.exports = RequestNamespace
