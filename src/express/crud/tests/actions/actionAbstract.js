'use strict'

class ActionAbstract {
  constructor() {
    if (this.constructor === ActionAbstract) {
      throw new TypeError('Can not construct abstract class.');
    }

    if (this.run === ActionAbstract.prototype.RUN) {
      throw new TypeError('Please implement abstract method \'run\'');
    }

    this.modelName   = null
    this.factoryName = null
    this.headers     = {}
  }

  run() {
    throw new TypeError('Do not call abstract method run from child.');
  }

  setModelName(modelName) {
    this.modelName = modelName
    return this
  }

  setFactoryName(factoryName) {
    this.factoryName = factoryName
    return this
  }

  setHeader(header) {
    this.headers = _.assign(this.headers, header)
    return this
  }

  clear() {
    this.modelName   = null
    this.factoryName = null
    this.headers     = {}
    return this
  }
}

module.exports = ActionAbstract