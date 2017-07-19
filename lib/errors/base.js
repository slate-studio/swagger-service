'use strict'

class Base extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }

  setServiceName(serviceName) {
    this.serviceName = serviceName
  }

  getStatusCode() {
    return _.get(this, 'statusCode', null)
  }

  setOperationId(operationId) {
    this.operationId = operationId
  }

  render() {
    return {
      message:  this.message
    }
  }
}

module.exports = Base