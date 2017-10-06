'use strict'

const debug = require('debug')('swagger:requestParameters')

const parameters = (req, res, next) => {
  if (req.swagger) {
    const { operationId } = req.swagger.operation
    const parameters  = {}

    _.forEach(req.swagger.params, (param, key) => parameters[key] = param.value)

    log.info({ operationId, parameters })

    req.swaggerParameters = parameters
    req.defaultScope = { _deleted: false }
  }

  next()
}

module.exports = function create(fittingDef, bagpipes) {
  debug('config: %j', fittingDef)

  return function requestParameters(context, cb) {
    debug('exec')
    parameters(context.request, context.response, cb)
  }
}
