'use strict'

const responses = require('../helpers/responses')

module.exports = (model) => {
  return (req, res) => {
    const params      = req.body
    const object      = new model(params)
    const operationId = req.swagger.operation.operationId

    log.info(operationId, params)

    object.save((err) => {
      responses.createResponse(res, err, object)
    })
  }
}
