'use strict'

module.exports = params => {
  return {
    get: (name) => {
      return params[name] || null
    }
  }
}