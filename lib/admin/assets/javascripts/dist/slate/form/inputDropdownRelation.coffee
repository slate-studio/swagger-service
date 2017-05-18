# NOTE: This is an abstract class.
class @InputDropdownRelation extends InputDropdown
  _config: ->
    super()

    @_ 'collection',         []
    @_ 'defaultSelectable',  false

  _renderOptions: ->
    disabled = if @defaultSelectable then '' else 'disabled'
    $option =$ "<option #{disabled} selected='true' value=''>#{@placeholder}</option>"
    @$el.append $option
    @_loadOptions()

  _renderOption: (item) ->
    value = item[@valueAttribute]
    title = @titleAttribute?(item) || item[@titleAttribute]

    $option =$ "<option value='#{value}'>#{title}</option>"
    @$el.append $option

  _loadOptions: (perPage=25, page=1) ->
    params = $.extend({}, @scope)
    params.page    = page
    params.perPage = perPage

    api.send @tag, @operationId, params, (success) =>
      @collection = success.obj
      @_renderOption(item) for item in @collection
      if success.headers['x-next-page']
        nextPage = parseInt(success.headers['x-next-page'])
        @_loadOptions(perPage, nextPage)

      else
        @disable(false)

        if @value
          @$el.val(@value)
        @_onOptionsAdded?()

  selectedObject: ->
    value = @$el.val()
    for item in @collection
      if String(item[@valueAttribute]) == value
        return item
    return null

