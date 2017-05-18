#= require dist/slate/index

$ ->
  SWAGGER_URL = $('link[role="swagger"]').attr('href')

  window.api = new SwaggerService
    url: SWAGGER_URL
    success: ->
      initialize()
