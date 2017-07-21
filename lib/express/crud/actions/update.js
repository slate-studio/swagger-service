'use strict'

const responses         = require('../responses')
const buildFindOneQuery = require('../helpers/buildFindOneQuery')
const catchNotFound     = require('../helpers/catchNotFound')
const errors            = require('./../../../errors')

module.exports = (model, defaultScope) => {
  return (req, res) => {
    const id          = req.swagger.params.id.value
    const query       = buildFindOneQuery(defaultScope, id)
    const params      = req.body
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query, params)

    // TODO: This doesn't call the callback if validation error,
    //       e.g uniq emails. So maybe we should use find + save.
    model.findOneAndUpdate(query, params, { new: true }).exec()
      .then(catchNotFound)
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
