'use strict'

class CustomRequestNamespace {

  constructor(options) {
    this.namespace = {}

    _.forEach(options, (value, name) => {

      if (_.toLower(name).substr(0, 2) === 'x-') {
        name = _.toLower(name).replace('x-', '')
        name = _.camelCase(name)
      }
      
      this.set(name, value)
    })
  }

  get(name) {
    return this.namespace[name] || null
  }

  set(key, value) {
    this.namespace[key] = value
  }

}

module.exports = CustomRequestNamespace