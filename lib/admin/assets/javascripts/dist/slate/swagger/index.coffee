#-------------------------------------------------------------------------------
# USAGE:
# window.api = new SwaggerService(options)
#-------------------------------------------------------------------------------
class @SwaggerService
  constructor: (@options) ->
    @_config()

    new SwaggerClient(@url, { disableInterfaces: true })
      .then (@swagger) => @success()

  _config: ->
    @_ = _config

    @_ 'url'
    @_ 'success'

  send: (operationId, parameters, onSuccess, onError) ->
    params =
      operationId: operationId
      parameters:  parameters

    @swagger.execute(params)
      .then (success) =>
        $(@).trigger("#{operationId}.success", [ success ])
        onSuccess?(success)

      .catch (err) =>
        if err.response
          $(@).trigger("#{operationId}.error", [ err.response ])

          msg = err.response.statusText
          onError?(msg)

        else
          throw err

    return

  getOperation: (operationId) ->
    for path, methods of @swagger.spec.paths
      operation = _.find(methods, { operationId: operationId })
      if operation? then return operation

  getDefinition: (name) ->
    @swagger.spec.definitions[name].properties

  getOperationParameter: (operationId, parameter) ->
    _.find(@getOperation(operationId).parameters, { name: parameter })
