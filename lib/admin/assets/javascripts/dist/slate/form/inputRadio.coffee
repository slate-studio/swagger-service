class @InputRadios extends Input
  constructor: (@$container, @options={}) ->
    @_config()

    @_buildLayout()
    @_buildOptions()

    @_buildEl()

    @$container.append @$layout

  _config: ->
    super()

    @_ 'enum',     []
    @_ 'default',  ''

  _buildLayout: ->
    @$layout =$ "<div class='input-radio'></div>"

  _buildEl: ->
    @$el = @$layout.find('input')

  _buildOptions: ->
    for value, title of @enum
      checked = ''
      if value == @default
        checked = 'checked'

      $option =$ """
        <label class='checkbox'>
          <input #{checked} type='radio' name='#{@name}' value='#{value}'> #{title}
        </label>"""


      @$layout.append $option

  getValue: ->
    @$layout.find('input:checked').val()

  setValue: (@value, object)->
    @$el.find(':checked').attr('checked', false)
    @$el.find("[value='#{@value}']").attr('checked', true)
