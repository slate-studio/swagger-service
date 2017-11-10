'use strict'

const responses = require('../../responses')
const helpers   = require('../helpers')

module.exports = (modelName, options={}) => {
  return (req, res) => {
    helpers.setActionFilters(req, options)

    const params      = req.body || {}
    const operationId = req.swagger.operation.operationId

    log.info(operationId, params)

    const model = Model(modelName)

    // TODO: We should use this.object to make it assesible by filter.
    let object

    req.beforeAction(params)
      .then(() => {
        object = new model(params)
        return object.save()
      })
      .then(() => req.afterAction(object))
      .then(newObject => responses.createdResponse(req, res, newObject || object))
      .catch(error => responses.unprocessableEntityResponse(req, res, error))
  }
}
