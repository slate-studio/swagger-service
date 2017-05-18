class @InputJson extends Input
  _buildEl: ->
    @$el =$ "<textarea>"

  setValue: (@value, object) ->
    jsonValue = JSON.stringify(@value)
    @$el.val(jsonValue)

  getValue: ->
    jsonValue = @$el.val()
    JSON.parse(jsonValue)

  isValid: ->
    inputIsValid = @$el[0].validity.valid
    try
      @getValue()
      jsonIsValid = true
    catch e
      @invalidJsonMessage = 'Specified value is not valid JSON object'
      jsonIsValid = false
      console.error(e.message, e.name)

    inputIsValid && jsonIsValid

  validationMessage: ->
    @invalidJsonMessage
