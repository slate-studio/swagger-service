'use strict'
const timeout = require('connect-timeout')

const executionTimeout = 15000

module.exports =  (req, res, next) => {
  const handler = timeout(executionTimeout)
  handler(req, res, err => {
    if (err) {
      log.error(err)
      const message = err.message
      return res.status(err.statusCode).json({ message })
    }

    next()
  })
}