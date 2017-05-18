#= require ./input

# TODO: Figure out why input class does not have time to load before checkbox
class @InputCheckbox extends Input
  constructor: (@$container, @options={}) ->
    @_config()
    @_buildEl()
    @_setName()

    @_bindEvents()

    @formItem.getLabel().prepend @$el

  _config: ->
    super()
    @_ 'formItem'

  _buildEl: ->
    @$el =$ "<input type='checkbox' />"

  getValue: ->
    return @$el.is(':checked')

  setValue: (@value, object) ->
    @$el.prop('checked', @value)
