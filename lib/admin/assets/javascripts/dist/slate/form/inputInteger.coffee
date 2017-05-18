class @InputInteger extends Input
  _buildEl: ->
    @$el =$ "<input type=number step=1 />"

  getValue: ->
    value = super()
    return parseInt(value)
