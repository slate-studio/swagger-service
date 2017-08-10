'use strict'

const buildSecurity = () => {
  return _.map(C.swagger.spec.securityDefinitions, (config, key) => {
    const def = {} ; def[key] = [] ; return def
  })
}

module.exports = (spec) => {
  const publicOperationIds = C.swagger.publicOperationIds
  const security = buildSecurity()

  _.forEach(spec.paths, methods => {
    _.forEach(methods, (operation) => {
      const operationId = operation.operationId

      if (publicOperationIds.indexOf(operationId) == -1) {
        operation.security = security
      }
    })
  })
}
