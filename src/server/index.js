'use strict'

const middleware = require('./middleware')

exports = module.exports = service => {
  if (C.service.port) {
    const port = C.service.port

    return middleware(service)
      .then(() => {
        log.info(`Server is listening on port ${port}`)

        service.listen(port, callback => service.emit('started', callback))
      })
      .catch(error => {
        log.error('Server middleware error:', error)

        process.exit(1)
      })
  }

  return Promise.resolve()
}

exports.crud      = require('./crud')
exports.responses = require('./responses')
