class @InputNumber extends Input
  constructor: (@$container, @options={}) ->
    super
    @setMinimum(@minimum)
    @setMaximum(@maximum)

  _config: ->
    super()
    @_ 'minimum', ''
    @_ 'maximum', ''

  _buildEl: ->
    @$el =$ "<input type='number'/>"

  getValue: ->
    value = super()
    return Number(value)

  setMinimum: (value) ->
    if value
      @$el.attr('min', value)

  setMaximum: (value) ->
    if value
      @$el.attr('max', value)

