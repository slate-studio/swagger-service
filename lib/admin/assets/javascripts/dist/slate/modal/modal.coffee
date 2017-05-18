class @Modal
  constructor: (@$container, @options={}) ->
    @_config()

    @regex = new RegExp(@re)

    @_buildEl()
    @_buildLayout()
    @_bindEvents()

    @$container.append @$el

  _config: ->
    @_ = _config

    @_ 'id'
    @_ 'title',   'Modal'
    @_ 'content', 'Content'
    @_ 're',      "^#{@id}$"

  _buildEl: ->
    @$el =$ "<div class='modal-box hide' id='#{@id}'>"

  _buildLayout: ->
    @$el.append """
      <div class='modal'>
        <span class='close'></span>
        <div class='_title modal-header'>#{@title}</div>
        <div class='modal-body'></div>
      </div>"""

    @$title = @$el.find '._title'

  _bindEvents: ->
    $(window).on 'hashchange', @_onHashchange

    onRenderObserver @$container, @_initializeModalKube
    onRenderObserver @$container, @_onHashchange

  _initializeModalKube: =>
    options =
      target:    "##{@id}"
      width:     '860px'
      position:  'top'
      animation: false

    @modal = new Kube.Modal($('<span />')[0], options)

  _onHashchange: =>
    path = window.location.hash.replace('#/', '')

    if @regex.test(path)
      @modal.parentModal = this
      @modal.path = path
      @modal.load()

      @_render(path)

    else
      @_close()

  _render: (path) ->
    @modal.setContent(@content)

  _close: ->
    @modal.originalClose()

  setClosePath: (@closePath='#/') ->
    $.noop()
