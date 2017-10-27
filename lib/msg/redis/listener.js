'use strict'

class Listener {
  constructor({ config, handlers, timeout }) {
    this.config = config
    log.debug('MESSAGE', handlers, timeout)
  }

  listen() {
    return Promise.resolve()
  }
}
