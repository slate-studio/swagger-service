'use strict'

const responses         = require('../helpers/responses')
const buildFindOneQuery = require('../helpers/buildFindOneQuery')

module.exports = (model, defaultScope) => {
  return (req, res) => {
    const id          = req.swagger.params.id.value
    const query       = buildFindOneQuery(defaultScope, id)
    const params      = { _deleted: true }
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query)

    model.findOneAndUpdate(query, params, { new: true }, (err, object) => {
      responses.deleteResponse(res, err, object)
    })
  }
}
