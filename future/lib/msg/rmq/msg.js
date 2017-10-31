'use strict'

const _ = require('lodash')

const RequestNamespace    = require('../../requestNamespace')
const getRequestNamespace = require('../../getRequestNamespace')

class Msg {
  constructor(channel, msg) {
    this.channel = channel
    const json   = msg.content.toString()
    this.object  = JSON.parse(json)
    this.headers = msg.properties.headers
  }

  exec(callback, next) {
    const requestId           = _.get(this.headers, 'requestId', null)
    const authenticationToken = _.get(this.headers, 'authenticationToken', null)
    const namespace           = { requestId }

    // TODO: Implement support for authentication method.

    if (!authenticationToken) {
      log.error('[msg] AuthenticationToken header is not defined, skiping message')

      if (next) {
        next()
      }

      return
    }

    _.extend(namespace, getRequestNamespace(authenticationToken))

    this.requestNamespace = new RequestNamespace(namespace)
    this.requestNamespace.save([], () => callback(this, next))
  }
}

module.exports = Msg
