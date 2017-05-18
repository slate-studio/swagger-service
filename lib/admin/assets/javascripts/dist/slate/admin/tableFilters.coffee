class @TableFilters
  constructor: (@$container, @options={}) ->
    @_config()
    @_buildFilters()

  _config: ->
    @_ = _config
    @_ 'table'
    @_ 'filters'
    @_ 'scope'

  _bindFilterEvents: (input, filterSpec) ->
    input.$el.on 'change', =>
      @_filter(input, filterSpec, @table)

  _filter: (input, filterSpec, table) ->
    params =
      page: 1

    if input.getValue()
      params[filterSpec.paramName] = input.getValue()
    else
      table.deleteParam(filterSpec.paramName)

    table.updateParams(params)
    table.updateState()
    table.render()

  _buildFilters: ->
    for name, spec of @filters
      inputOptions =
        name: spec.name || name
        scope: @scope
        paramName: spec.paramName
        defaultSelectable: true

      if spec.placeholder
        inputOptions['placeholder'] = spec.placeholder

      if spec.enum
        inputOptions['enum'] = spec.enum

      spec.inputType = 'InputText' if !spec.inputType
      input = new window[spec.inputType](@$container, inputOptions)

      @_bindFilterEvents input, spec
