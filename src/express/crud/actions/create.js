'use strict'

const responses = require('../../responses')
const helpers   = require('../helpers')

module.exports = (modelName, options={}) => {
  return (req, res) => {
    helpers.setActionFilters(req, options)

    const params      = req.body
    const operationId = req.swagger.operation.operationId

    log.info(operationId, params)

    const model = Model(modelName)
    let   object

    req.beforeAction(params)
      .then(() => {
        object = new model(params)
        return object.save()
      })
      .then(() => req.afterAction(object))
      .then(() => responses.createdResponse(req, res, object))
      .catch(error => responses.unprocessableEntityResponse(req, res, error))
  }
}
