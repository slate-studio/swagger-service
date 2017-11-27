'use strict'
const timeout    = require('connect-timeout')
const onFinished = require('on-finished')
const onHeaders  = require('on-headers')

const executionTimeout = 15000

module.exports =  (req, res, next) => {
  res.hasFinished = false
  onFinished(res, () => res.hasFinished = true)
  onHeaders(res, () => res.hasFinished = true)

  const handler = timeout(executionTimeout)
  handler(req, res, next)
}