'use strict'

const responses = require('../responses')

module.exports = (model) => {
  return (req, res) => {
    const params      = req.body
    const operationId = req.swagger.operation.operationId

    log.info(operationId, params)

    const object = new model(params)

    object.save()
      .then(()     => responses.createdResponse(req, res, object ))
      .catch(error => responses.unprocessableEntityResponse(req, res, error))
  }
}
