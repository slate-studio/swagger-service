class @TableSearch
  constructor: (@$container, @table, @query, @options={}) ->
    @_config()

    @_buildEl()
    @_buildInput()
    @_bindEvents()

    @_appendEl()

  _config: ->
    @_ = _config

    @_ 'tag'

    searchFor        = _.startCase(@tag).toLowerCase()
    @placeholder     = "Search for #{searchFor}"
    @resetBtnName    = 'Reset search'
    @resultsTypeName = "#{@tag.toLowerCase()}"

  _buildEl: ->
    @$el =$ "<form class='search m0'>"

  _appendEl: ->
    @$container.append @$el

  _buildInput: ->
    @$input =$ """<input type='text'
                         class='search'
                         name='search'
                         placeholder='#{@placeholder}'>"""

    @$summary =$ "<div class='smaller p10'></div>"

    @$controlls =$ "<div class='controls'>"
    @$controlls.append @$input

    @$el.append @$controlls
    @$el.append @$summary

  _search: (query) ->
    query ?= @$input.val()
    @table.updateParams({ page: 1, search: query })
    @table.updateState()
    @table.render()

  _bindEvents: ->
    @$el.on 'submit', (e) =>
      @_search()
      false

    @$el.on 'click', '.reset', (e) =>
      e.preventDefault()
      @_search('')

  _renderSummary: (headers) ->
    results_total = headers['x-total-count']
    @$summary.append "#{results_total} #{@resultsTypeName}&nbsp;&nbsp;&nbsp;"

  _renderReset: ->
    @$summary.append "<a href='#/reset' class='reset'>#{@resetBtnName}</a>"

  update: (@query, headers) ->
    @$input.val(@query)
    @$summary.html('')

    if @query
      @_renderSummary(headers)
      @_renderReset()
