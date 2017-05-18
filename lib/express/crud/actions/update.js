'use strict'

const responses         = require('../helpers/responses')
const buildFindOneQuery = require('../helpers/buildFindOneQuery')

module.exports = (model, defaultScope) => {
  return (req, res) => {
    const id          = req.swagger.params.id.value
    const query       = buildFindOneQuery(defaultScope, id)
    const params      = req.body
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query, params)

    model.findOneAndUpdate(query, params, { new: true }, (err, object) => {
      // TODO: This is doesn't call the callback if validation error (uniq email)
      responses.updateResponse(res, err, object)
    })
  }
}
