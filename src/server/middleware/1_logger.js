'use strict'

module.exports = (req, res, next) => {
  const method = req.method
  const path   = req.url

  log.info(`${method} ${path}`)

  next()
}
