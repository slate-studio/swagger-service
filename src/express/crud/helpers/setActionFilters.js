'use strict'

const proxy = (...args) => Promise.resolve(...args)

module.exports = (req, options={}) => {
  req.beforeAction = options.beforeAction || proxy
  req.afterAction  = options.afterAction  || proxy
}
