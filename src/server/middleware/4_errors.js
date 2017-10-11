'use strict'

const responses = require('../responses')

module.exports = (error, req, res, next) => {
  log.error(error)

  const response = _.pick(error, [ 'name', 'message', 'stack' ])
  res.status(500).json(response)
}
