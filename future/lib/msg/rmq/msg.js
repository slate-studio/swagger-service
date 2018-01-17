'use strict'

const _ = require('lodash')

// const RequestNamespace    = require('../../requestNamespace')
// const getRequestNamespace = require('../../getRequestNamespace')
const RequestNamespace2 = require('../../../../src/utils/requestNamespace')

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
    // const namespace           = { requestId }

    const headers = {
      'authorization': authenticationToken,
      'x-request-id':           requestId
    }

    // TODO: Implement support for authentication method.

    if (!authenticationToken) {
      log.error('[msg] AuthenticationToken header is not defined, skiping message')

      if (next) {
        next()
      }

      return
    }

    // _.extend(namespace, getRequestNamespace(authenticationToken))

    // this.requestNamespace = new RequestNamespace(namespace)

    this.requestNamespace = new RequestNamespace2(headers)
    this.requestNamespace.save([], () => callback(this, next))
  }
}

module.exports = Msg
