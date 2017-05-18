class @Input
  constructor: (@$container, @options={}) ->
    @_config()
    @_buildEl()
    @_setName()

    @setPlaceholder(@placeholder)
    @setRequired(@required)

    @_bindEvents()

    @$container.append @$el

  _config: ->
    @_ = _config

    if typeof @options.default is 'function'
      @options.default = @options.default()

    @_ 'name'
    @_ 'form',        false
    @_ 'placeholder', ''
    @_ 'required',    false
    @_ 'onChange',    $.noop

  _buildEl: ->
    @$el =$ "<input type='text' />"

  _setName: ->
    @$el.prop('name', @name)

  _bindEvents: ->
    @$el.on 'change', @onChange.bind(this)

  isValid: ->
    return true unless @$el[0].validity
    @$el[0].validity.valid

  validationMessage: ->
    @$el[0].validationMessage

  toggleValidation: ->
    @$el.toggleClass('error', !@isValid())

  setValue: (@value, object) ->
    @$el.val(@value)

  getValue: ->
    @$el.val()

  disable: (value) ->
    @$el.prop('disabled', value)

  setPlaceholder: (value) ->
    @$el.prop('placeholder', value)

  setRequired: (value) ->
    @$el.prop('required', value)

  getForm: ->
    @form

  # if @type == 'number'
  #   return parseFloat(value)

  # if @type == 'boolean'
  #   return (value == 'true' || value == '1')

  # return value
