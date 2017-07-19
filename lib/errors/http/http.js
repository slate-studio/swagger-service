'use strict'

const Base = require('./../base')

class Http extends Base {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
  }

  render() {
  	const output = super.render()

    if (_.has(this, 'statusCode')) {
      output.statusCode = this.getStatusCode()
  	}

  	if (_.has(this, 'serviceName')) {
      output.serviceName = this.serviceName
  	}

  	if (_.has(this, 'operationId')) {
      output.operationId = this.operationId
  	}

    return output
  }
}

module.exports = Http