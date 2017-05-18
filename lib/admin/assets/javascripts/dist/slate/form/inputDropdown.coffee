class @InputDropdown extends Input
  _config: ->
    super()

    @_ 'enum',     []
    @_ 'default',  ''

  _buildEl: ->
    @$el =$ "<select disabled class='w100' />"
    @_renderOptions()

  _renderOption: (value, title, disabled=false) ->
    disabledOption = ''
    if disabled
      disabledOption = 'disabled'

    $option =$ "<option #{disabledOption} value='#{value}'>#{title}</option>"
    @$el.append $option

  _renderOptions: ->
    $option =$ "<option disabled selected>Select</option>"
    @$el.append $option

    if @enum instanceof Array && @enum[0] instanceof Object
      for value in @enum
        @_renderOption(value.value, value.title, value.disabled)
    else if @enum instanceof Array
      for value in @enum
        @_renderOption(value, value)
    else
      for value, title of @enum
        @_renderOption(value, title)

    if @default
      @$el.val(@default)

    if @value
      @$el.val(@value)

    @disable(false)

  updateOptions: (@enum) ->
    @$el.html('')
    @_renderOptions()

  # NOTE: If no option is selected, do not return null but ''
  getValue: ->
    @$el.val() || ''
