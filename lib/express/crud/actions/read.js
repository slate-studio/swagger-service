'use strict'

const responses         = require('../helpers/responses')
const buildFindOneQuery = require('../helpers/buildFindOneQuery')

module.exports = (model, defaultScope) => {
  return (req, res) => {
    const id          = req.swagger.params.id.value
    const query       = buildFindOneQuery(defaultScope, id)
    const operationId = req.swagger.operation.operationId

    log.info(operationId, query)

    model.findOne(query, (err, object) => {
      responses.readResponse(res, err, object)
    })
  }
}
