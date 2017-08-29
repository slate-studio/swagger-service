'use strict'

const responses = require('../../responses')
const errors    = require('../../../errors')
const helpers   = require('../helpers')

module.exports = (modelName, options={}) => {
  return (req, res) => {
    helpers.setActionFilters(req, options)

    const id          = req.swagger.params.id.value
    const query       = helpers.buildFindOneQuery(req.defaultScope, id)
    const params      = req.body
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query, params)

    const model = Model(modelName)

    // TODO: This doesn't call the callback if validation error,
    //       e.g uniq emails. So maybe we should use find + save.
    req.beforeAction(query, params)
      .then(() => model.findOneAndUpdate(query, params, { new: true }).exec())
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
