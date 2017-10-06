'use strict'

const responses = require('../responses')

module.exports = (error, req, res, next) => {
  responses.applicationErrorResponse(req, res, error)
}
