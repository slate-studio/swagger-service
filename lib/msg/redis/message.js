'use strict'

class Message {
  constructor(config, data, headers) {
    this.config = config
    log.debug('MESSAGE', data, headers)
  }

  publish(address) {
    return Promise.resolve(address)
  }

  send(queue) {
    return Promise.resolve(queue)
  }
}