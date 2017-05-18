@getUrlParameter = (sParam) ->
  sPageURL = window.location.search.substring(1)
  sURLVariables = sPageURL.split('&')

  for v in sURLVariables
    sParameterName = v.split('=')

    if sParameterName[0] == sParam
      return sParameterName[1]

  return undefined

@_config = (name, defaultValue) ->
  this[name] = @options[name] ?
               @$container?.data(name) ?
               getUrlParameter(name) ?
               defaultValue

  if not this[name]? and defaultValue is undefined
    console.error("'#{name}' should be defined for:", this)
