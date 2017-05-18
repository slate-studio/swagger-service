class @FormItem
  constructor: (@$container, @options={}) ->
    @_config()

    @_buildEl()
    @_buildLabel()
    @_buildError()
    @_buildInput()

    @$container.append @$el

  _config: ->
    @_ = _config

    if typeof @options.enum is 'function'
      @options.enum = @options.enum()

    @_ 'name'
    @_ 'namespace',   'form-item'
    @_ 'form',        false
    @_ 'enum',        false # NOTE: this should be Object or Array
    @_ 'type',        'string'
    @_ 'format',      ''    # NOTE: Pulled from swagger schema.
    @_ 'description', @name # NOTE: Pulled from swagger schema.
    @_ 'label',       @description
    @_ 'required',    false
    @_ 'disabled',    false
    @_ 'inputType',   @_detectInputType()
    @_ 'inputClass',  window[@inputType] || InputString

    # hint
    # placeholder
    # ...

  _detectInputType: ->
    switch @name
      when 'email'
        return 'InputEmail'

    switch @format
      when 'password'
        return 'InputPassword'
      when 'date-time'
        return 'InputDateTime'
      when 'date'
        return 'InputDate'

    switch @type
      when 'integer'
        return 'InputInteger'
      when 'number'
        return 'InputNumber'
      when 'boolean'
        return 'InputCheckbox'
      when 'object'
        return 'InputJson'
      when 'array'
        return 'InputJson'

    if @enum
      return 'InputDropdown'

    return 'InputString'

  _buildEl: ->
    @$el =$ "<div class='#{@namespace}'>"

  _buildLabel: ->
    if @label
      @$label =$ "<label>#{ @label }&nbsp;</label>"

      if @required
        @$label.append "<span class='req'>*</span>"

      @$el.append @$label

  _buildError: ->
    @$error =$ "<span class='error'></span>"
    @$label?.append @$error

  _buildInput: ->
    @options.formItem = this
    @input = new @inputClass(@$el, @options)
    @input.disable(@disabled)

  disable: (value) ->
    @input.disable(value)

  value: ->
    @input.getValue()

  populate: (value, object) ->
    @input.setValue(value, object)

  validate: ->
    isValid = @input.isValid()
    @input.toggleValidation()
    @toggleError !isValid

    if isValid
      return true

    else
      message = @input.validationMessage()
      @$error.text(message)
      return false

  toggleError: (state) ->
    @$error.toggle state

  clearError: ->
    @toggleError false
    @input.$el.toggleClass('error', false)

  getInput: ->
    @input

  getLabel: ->
    @$label

