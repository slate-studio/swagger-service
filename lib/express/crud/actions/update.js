'use strict'

const responses         = require('../responses')
const buildFindOneQuery = require('../helpers/buildFindOneQuery')
const catchNotFound     = require('../helpers/catchNotFound')
const documentNotFound  = require('./../../../errors/documentNotFound')

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
        switch (true) {
          case error instanceof documentNotFound :
            return responses.notFoundResponse(req, res, error)

          default :
            return responses.applicationErrorResponse(req, res, error)
        }
      })
  }
}
