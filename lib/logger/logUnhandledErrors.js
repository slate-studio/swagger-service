'use strict'

module.exports = () => {
  process.on('uncaughtException', err => {
    new Promise((resolve, reject) => {
      log.fatal('Uncaught exception:', err)
      resolve()
    }).then(res => process.exit(1))
  })

  process.on('unhandledRejection', (reason, p) => {
    log.fatal('Unhandled rejection at:', p, 'reason:', reason)
    setImmediate(() => process.exit(1))
  })
}
