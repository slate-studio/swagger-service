class @TablePager
  constructor: (@$container, @table, @responseHeaders) ->
    @_config()

    if @pages > 1
      @_buildEl()
      @_buildPerPageDropdown()
      @_buildControlls()
      @_render()
      @_bindEvents()

    @$container.append @$el

  _config: ->
    @windowSize       = 5
    @pages            = parseInt @responseHeaders['x-pages-count']
    @activePageNumber = parseInt @responseHeaders['x-page']
    @perPage          = parseInt @responseHeaders['x-per-page']
    @perPageName      = 'per&nbsp;page'

  _buildEl: ->
    @$el =$ "<nav class='pagination'>"

  _buildPerPageDropdown: ->
    @$perPageDropdown =$ '<select>'

    for pp in [10, 25, 50, 100]
      $pp =$ "<option value='#{pp}'>#{pp}</option>"
      if pp == @perPage
        $pp.prop('selected', true)
      @$perPageDropdown.append $pp

    $wrapper =$ '<aside>'
    $wrapper.append @$perPageDropdown
    $wrapper.append @perPageName
    @$el.append $wrapper

  _buildControlls: ->
    $wrapper =$ '<ul>'
    @$el.append $wrapper

    if @activePageNumber > 1
      $prevBtn =$ "<li class='prev'><a href='#/prev'>&larr;</a></li>"
      $wrapper.append $prevBtn

    $pages =$ '<li><ul></ul></li>'
    $wrapper.append $pages
    @$pages = $pages.children()

    if @activePageNumber != @pages
      $nextBtn =$ "<li class='next'><a href='#/next'>&rarr;</a></li>"
      $wrapper.append $nextBtn

  _render: ->
    if @pages > @windowSize + 4

      leftPage  = @activePageNumber - (@windowSize - 1)/2
      rightPage = @activePageNumber + (@windowSize - 1)/2

      if leftPage <= 0
        rightPage += (leftPage - 1) * -1
        leftPage = 1

      if rightPage - @pages >= 0
        leftPage += (rightPage - @pages) * -1
        rightPage = @pages

      if leftPage != 1
        @_addPage(1)

      if leftPage == 3
        @_addPage(2)
      else if leftPage > 2
        @_addGap()

      for pageNumber in [leftPage..rightPage]
        @_addPage(pageNumber)

      if @pages - rightPage == 2
        @_addPage(@pages - 1)
      else if @pages - rightPage > 1
        @_addGap()

      if rightPage != @pages
        @_addPage(@pages)

    else
      for pageNumber in [1..@pages]
        @_addPage(pageNumber)

  _addPage: (number) ->
    $page =$ "<li class='page'>
                <a href='#/#{number}' data-page='#{number}'>#{number}</a>
              </li>"
    if number == @activePageNumber
      $page.addClass 'active'
    @$pages.append $page

  _addGap: ->
    $page =$ "<li class='page'><em>...</em></li>"
    @$pages.append $page

  _updateComponent: (page) ->
    @table.updateParams({ perPage: @perPage, page: page })
    @table.updateState()
    @table.render()

  _bindEvents: ->
    @$el.on 'click', '.page a', (e) =>
      e.preventDefault()
      page = $(e.currentTarget).data 'page'
      @_updateComponent(page)

    @$el.on 'click', '.prev a', (e) =>
      e.preventDefault()
      @_updateComponent(@activePageNumber - 1)

    @$el.on 'click', '.next a', (e) =>
      e.preventDefault()
      @_updateComponent(@activePageNumber + 1)

    @$el.on 'change', 'select', (e) =>
      @perPage = @$perPageDropdown.val()
      page = 1
      @_updateComponent(page)

  destroy: ->
    @$el?.remove()
