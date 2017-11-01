'use strict'

const _ = require('lodash')

// const RequestNamespace  = require('../../requestNamespace')
const RequestNamespace2 = require('../../../../src/utils/requestNamespace')

class Message {
  constructor(client, object, headers={}) {
    this.client = client
    
    if (_.isEmpty(headers)) {
      const requestNamespace    = new RequestNamespace2()
      const authenticationToken = requestNamespace.get('authenticationToken')
      const requestId           = requestNamespace.get('requestId')
      headers                   = { authenticationToken, requestId }
    }

    this.object = { object, headers }
    this.json   = JSON.stringify(this.object)
  }

  publish(address) {
    log.info('[msg] Publish to', address, this.object.object)

    return this.client.publishAsync(address, this.json)
      .catch(error => log.error('[msg] Message publish error:', error))
  }

  send(qname) {
    log.info('[msg] Send to', qname, this.object.object)

    return this.client.lpushAsync(qname, this.json)
      .catch(error => log.error('[msg] Message send error:', error))
  }
}

module.exports = Message
