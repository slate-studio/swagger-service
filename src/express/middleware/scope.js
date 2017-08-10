'use strict'

module.exports = (req, res, next) => {
  req.defaultScope = { _deleted: false }
  next()
}
