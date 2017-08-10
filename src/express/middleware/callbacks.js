'use strict'

module.exports = (req, res, next) => {
  req.beforeAction = (...args) => Promise.resolve(...args)
  req.afterAction  = (...args) => Promise.resolve(...args)

  next()
}
