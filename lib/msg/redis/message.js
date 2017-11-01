'use strict'

const _ = require('lodash')

const connect = require('../../db/redis')
const RequestNamespace = require('../../requestNamespace')

class Message {
  constructor(config, object) {
    const requestNamespace = new RequestNamespace()

    const { authenticationToken, requestId } = requestNamespace.getAll()
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
          .catch(error => log.error('[msg] Message publish error:', error))
          .finally(() => client.quit())
      })
  }

  send(qname) {
    log.info('[msg] Send to', qname, this.object.object)

    return connect(this.config)
      .then(client => {
        return client.lpushAsync(qname, this.json)
          .catch(error => log.error('[msg] Message send error:', error))
          .finally(() => client.quit())
      })
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
