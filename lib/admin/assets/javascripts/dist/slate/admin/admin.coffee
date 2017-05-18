#-------------------------------------------------------------------------------
# USAGE:
# admin = new Admin($container, { model: 'User' })
# OR
# <div id='admin' data-component='Admin'
#                 data-model='User'></div>
#-------------------------------------------------------------------------------
class @Admin
  constructor: (@$container, @options={})->
    @_config()

    @_buildEl()
    @_buildLayout()
    @_buildTable()

    @_buildAdminModal()
    @_buildCreateAction()
    # @_buildEdit()
    @_bindEvents()

    @$container.append @$el

    api.send("index#{@tag}", { perPage: 25 })

  _config: ->
    @_ = _config

    @_ 'title'
    @_ 'tag'
    @_ 'model'
    @_ 'tableComponent', "#{@model}AdminTable"

  _buildEl: ->
    @$el =$ "<div class='admin'>"

  _buildLayout: ->
    @$el.append """
      <header class='_header'>
        <h5>#{@title}</h5>
      </header>
      <div class='_search mb1'>
        <input type='text'
               class='search'
               name='search'
               placeholder='Search'>
      </div>
      <div class='_toolbar mb1'>
      </div>
      <section class='_content'>
      </section>"""

    @$header  = @$el.find '._header'
    @$toolbar = @$el.find '._toolbar'
    @$content = @$el.find '._content'

  _buildTable: ->
    options =
      tag:   @tag
      model: @model

    Klass = window[@tableComponent] || window['Table']
    @table = new Klass(@$content, options)

  _buildAdminModal: ->
    options =
      id:    "#{@model}AdminModal"
      model: @model
      scope: @scope

    @adminModalForm = new AdminModal(@$container, options)

  _buildCreateAction: ->
    unless api.getOperation "create#{@model}"
      return

    title = _.startCase(@model).toLowerCase()

    @$toolbar.prepend """
      <a href='#//new' class='button small'>
        Create #{title}
      </a>"""

  _bindEvents: ->
    $(api).on "index#{@tag}.success", (e, success) =>
      @table.render(success.obj)

  # _buildEdit: ->
  #   options =
  #     model:     @model
  #     id:        "Edit#{@model}Modal"
  #     title:     "Edit #{@entity}"
  #     regex:     '^.{24}$|^\\d+$'
  #     namespace: "admin-edit"
  #     scope:     @scope

  #   @importModal = new ModalForm(@$container, options)

  # _bindEvents: ->
  #   $(api).on "create#{@model} update#{@model} destroy#{@model}", =>
  #     @table.render()
