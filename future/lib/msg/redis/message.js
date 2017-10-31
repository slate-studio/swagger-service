'use strict'

const _ = require('lodash')

const RSMQPromise = require('rsmq-promise')
const connect     = require('../../db/redis')
const RequestNamespace  = require('../../requestNamespace')
const RequestNamespace2 = require('../../../../src/utils/requestNamespace')

class Message {
  constructor(config, object) {
    const requestNamespace    = new RequestNamespace2()
    const authenticationToken = requestNamespace.get('authenticationToken')
    const requestId           = requestNamespace.get('requestId')

    const headers = { authenticationToken, requestId }

    this.config = config
    this.object = { object, headers }
    this.json   = JSON.stringify(this.object)
  }

  publish(address) {
    log.info('[msg] Publish to', address, this.object.object)

    return connect(this.config)
      .then(client => {
        return client.publishAsync(address, this.json)
          .then(() => client.quit())
      })
  }

  send(qname) {
    log.info('[msg] Send to', qname, this.object.object)

    const client = new RSMQPromise(this.config)

    return Promise.resolve()
      .then(() => this._assertQueue(client, qname))
      .then(() => client.sendMessage({ qname, message: this.json }))
      .catch(error => log.error('[msg] Message send error:', error))
      .finally(() => client.rsmq.quit())
  }

  _assertQueue(client, qname) {
    return client.listQueues()
      .then(queues => {
        const isQueueCreated = _.includes(queues, qname)

        if (!isQueueCreated) {
          return client.createQueue({ qname })
        }
      })
  }
}

module.exports = Message
