'use strict'

const responses = require('../../responses')
const errors    = require('../../../errors')
const helpers   = require('../helpers')

module.exports = (model, options={}) => {
  return (req, res) => {
    helpers.setActionCallbacks(req, options)

    const id          = req.swagger.params.id.value
    const query       = helpers.buildFindOneQuery(req.defaultScope, id)
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query)

    req.beforeAction(query)
      .then(() => model.findOne(query).exec())
      .then(helpers.catchNotFound(model))
      .then(object => req.afterAction(object))
      .then(object => responses.successResponse(req, res, object))
      .catch(error => {
        if (error instanceof errors.DocumentNotFound) {
          return responses.notFoundResponse(req, res, error)

        } else {
          return responses.applicationErrorResponse(req, res, error)

        }
      })
  }
}
