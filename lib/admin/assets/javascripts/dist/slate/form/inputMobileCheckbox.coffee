class @InputMobileCheckbox extends Input
  constructor: (@$container, @options={}) ->
    @_config()

    @_buildLayout()
    @_buildEl()
    @_setName()

    @_bindEvents()

    @$container.append @$layout
    @$container.addClass 'm0'

  _config: ->
    super()

    @_ 'description', 'Undefined'

  _buildLayout: ->
    @$layout =$ """
      <div class='mobile-checkbox bb1'>
        <label class='m0'>
          <span class='smaller'>#{@description}</span>
          <input type='checkbox' />
          <i class='float-right icon-success primary'></i>
          <i class='float-right icon-remove silver'></i>
        </label>
      </div>"""

  _buildEl: ->
    @$el = @$layout.find('input')

  getValue: ->
    @$el.is(':checked')

  setValue: (@value, object)->
    @$el.prop('checked', @value)
