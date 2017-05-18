class @InputMultiselect extends InputDropdown
  _buildEl: ->
    @$el =$ "<select multiple class='w100' />"
    @_renderOptions()

  _renderOptions: ->
    for value, title of @enum
      @_renderOption(value, title)
    @disable(false)
