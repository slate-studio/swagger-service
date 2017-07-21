'use strict'

const responses         = require('../responses')
const buildFindOneQuery = require('../helpers/buildFindOneQuery')
const catchNotFound     = require('../helpers/catchNotFound')
const errors            = require('./../../../errors')

module.exports = (model, defaultScope) => {
  return (req, res) => {
    const id          = req.swagger.params.id.value
    const query       = buildFindOneQuery(defaultScope, id)
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query)

    model.findOne(query).exec()
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
