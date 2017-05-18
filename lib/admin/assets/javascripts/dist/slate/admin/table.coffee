class @Table
  constructor: (@$container, @options={}) ->
    @_config()

    @_buildEl()
    @_buildLayout()
    @_buildHead()

    # @_buildHeader()
    # @_bindPopState()

    @$container.append @$el

  _config: ->
    @_ = _config

    @_ 'model'
    @_ 'definition', api.getDefinition(@model)

    # NOTE: Remove _id from definition, as integerId supposed to be used.
    delete @definition._id

  _buildEl: ->
    @$el =$ "<div>"

  _buildLayout: ->
    @$el.append """<table class='small'>
        <thead><tr class='_head'></tr></thead>
        <tbody class='_body'></tbody>
      </table>"""

    @$head = @$el.find '._head'
    @$body = @$el.find '._body'

  _buildHead: ->
    for fieldName, spec of @definition
      title = spec.title || _.startCase(fieldName)

      @$head.append """
        <th class='th-#{fieldName}'>
          <strong class='smaller upper'>#{title}</strong>
        </th>"""

  render: (items) ->
    html = ''
    for item in items
      id      = item.integerId
      columns = ''

      for fieldName, spec of @definition
        value    = item[fieldName]
        columns += "<td class='td-#{fieldName}'>#{value}</td>"

      html += "<tr data-id='#{id}'>#{columns}</tr>"

    @$body.html(html)

  reset: ->
    @$body.empty()

    # @_ 'namespace', ''
    # @_ 'clickable', true
    # @_ 'stateful',  true
    # @_ 'page',      1
    # @_ 'perPage',   25
    # @_ 'search',    ''
    # @_ 'id',        'integerId'
    # @_ 'scope',     {}
    # @_ 'params',    $.extend({}, @scope)
    # @_ 'filters',   false

    # @_ 'searchComponent', "#{@tag}Search"
    # @_ 'pagerComponent',  "#{@tag}Pager"

    # @_ 'defaultSearchComponent', TableSearch
    # @_ 'defaultPagerComponent',  TablePager

    # @_ 'isSearchable', api.hasParameter(@tag, 'index', 'search')

    # if @clickable
    #   @namespace += ' clickable'

    # @params.page    = @page
    # @params.perPage = @perPage
    # @params.search  = @search

    # @attributes = {}
    # @tableSchema = swaggerTableSchema(api, @model)
    # for name, spec of @tableSchema
    #   @attributes[name] = spec.description || name
















  # _buildHeader: ->
  #   @$header =$ "<header class='admin-table-header row auto gutters'>"
  #   @$container.append @$header

  #   if @isSearchable()
  #     @$search =$ "<div class='col'>"
  #     @$header.append @$search
  #     @_buildSearch()

  #   if @filters
  #     @$filters =$ "<div class='col'>"
  #     @$header.append @$filters
  #     @_buildFilters()

  # _buildSearch: ->
  #   @tableSearchClass = window[@searchComponent] || @defaultSearchComponent
  #   options =
  #     tag: @tag

  #   @searchBar = new @tableSearchClass(@$search, this, @params.query, options)

  # _buildFilters: ->
  #   options =
  #     table:   this
  #     filters: @filters
  #     scope:   @scope

  #   @tableFilters = new TableFilters(@$filters, options)

  # TODO: Swagger related conventions should be moved to other class.
  # _valueFilter: (obj, attributeName) ->
  #   spec  = @tableSchema[attributeName]
  #   value = obj[attributeName]

  #   if spec.filter
  #     spec.filter(obj)

  #   else if spec.format == 'date-time'
  #     dateTime = um(value).format('MM/DD/YY HH:mma').split(' ')
  #     "<span class='small'>
  #       #{dateTime[0]}&nbsp;#{dateTime[1]}
  #     </span>"

  #   else if spec.type == 'object'
  #     JSON.stringify(value)
  #       .replace(/,\"/g, ', "')
  #       .replace(/":"/g, '": "')
  #       .replace(/\{"/g, '{ "')
  #       .replace(/\"}/g, '" }')

  #   else
  #     value

  # _bindEvents: ->
  #   $(api).on 'index#{@model}.success', (e, tag, operationId, obj) =>
  #     @render()

  #   # if @tag == tag
  #   #   if operationId == "update#{@model}" ||
  #   #      operationId == "create#{@model}" ||
  #   #      operationId == "delete#{@model}"

  #   # if @clickable
  #   #   @$el.on 'click', 'tbody tr', (e) =>
  #   #     id = $(e.currentTarget).data 'id'
  #   #     @_onRowClick(e, id)

  # _onRowClick: (e, id) ->
  #   window.setLocationHash("#/#{id}")

  # # _buildHead: ->
  # #   html = ''
  # #   for name, title of @attributes
  # #     html += """<th class='th-#{name}'>
  # #         <h6 class='upper m0'>#{title}</h6>
  # #       </th>"""
  # #   @$el.append "<thead><tr>#{html}</tr></thead>"

  # # _buildBody: ->
  # #   @$body =$ '<tbody>'
  # #   @$el.append @$body

  # _renderTr: (id, html, obj) ->
  #   "<tr data-id='#{id}'>#{html}</tr>"

  # _renderTd: (name, value, obj) ->
  #   "<td class='td-#{name}'>#{value}</td>"

  # _renderItem: (obj) ->
  #   id = obj[@id]
  #   html = ''
  #   for name, title of @attributes
  #     value = @_valueFilter(obj, name)
  #     if value == undefined then value = 'Null'
  #     html += @_renderTd(name, value, obj)
  #   @_renderTr(id, html, obj)

  # _renderBody: (items) ->
  #   html = ''
  #   for item in items
  #     html += @_renderItem(item)
  #   @$body.append(html)

  # _renderPager: (responseHeaders) ->
  #   @pager?.destroy()
  #   @pagerClass = window[@pagerComponent] || @defaultPagerComponent
  #   @pager = new @pagerClass(@$container, this, responseHeaders)

  # _updateSearch: (headers) ->
  #   @searchBar?.update(@params.search, headers)

  # _bindPopState: ->
  #   if @stateful
  #     window.onpopstate = (e) =>
  #       if e.state && e.state.table
  #         @params = e.state.table
  #         @render()

  # updateParams: (params={}) ->
  #   $.extend @params, params

  # deleteParam: (name) ->
  #   delete @params[name]

  # updateState: ->
  #   if @stateful
  #     url = window.location.pathname + '?' + $.param(@params)
  #     window.history.pushState({ table: @params }, '', url)

  # # resetBody: ->
  # #   @$body.empty()

  # # render: ->
  #   # api.send "index#{@model}", @params, (success) =>
  #   #   @_renderPager(success.headers)

  #   #   @resetBody()
  #   #   @_renderBody(success.obj)
  #   #   @_updateSearch(success.headers)

  #   #   $(window).scrollTop(0)
