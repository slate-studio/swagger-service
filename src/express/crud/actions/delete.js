'use strict'

const responses = require('../../responses')
const errors    = require('../../../errors')
const helpers   = require('../helpers')

module.exports = (model, options={}) => {
  return (req, res) => {
    helpers.setActionCallbacks(req, options)

    const id          = req.swagger.params.id.value
    const query       = helpers.buildFindOneQuery(req.defaultScope, id)
    const params      = { $set: { _deleted: true } }
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query)

    req.beforeAction(query)
      .then(() => model.findOneAndUpdate(query, params, { new: true }).exec())
      .then(helpers.catchNotFound)
      .then(() => req.afterAction(query))
      .then(() => responses.noContentResponse(req, res))
      .catch(error => {
        if (error instanceof errors.DocumentNotFound) {
          return responses.notFoundResponse(req, res, error)

        } else {
          return responses.applicationErrorResponse(req, res, error)

        }
      })
  }
}
