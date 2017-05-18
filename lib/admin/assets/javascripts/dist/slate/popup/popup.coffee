#= require ../../kube/Message/Kube.Message

class @Popup
  constructor: (@$container, @options={}) ->
    @_config()
    @_buildEl()
    @_buildLayout()
    @_bindEvents()

    @$container?.append @$el

  _config: ->
    @_ = _config

    @_ 'namespace', 'message'
    @_ 'icons',
      '':      'info'
      info:    'info'
      success: 'error'
      error:   'error'

  _buildEl: ->
    @$el = $ "<div class='#{@namespace}'>"

  _buildLayout: ->
    @$el.append """
      <i class='_icon'></i>
      <span class='_message'></span>
      <span class='close'></span>"""

    @$icon    = @$el.find '._icon'
    @$message = @$el.find '._message'

  _bindEvents: ->
    onRenderObserver @$container, @_initializeKubeMessage

  _initializeKubeMessage: =>
    @message = new Kube.Message(@$el.get(), @options)
    @$el.removeClass 'open'
    $(@).trigger 'ready'

  hide: =>
    @message?.close()
    if @timeout?
      clearTimeout @timeout

  show: (text, type='', hideAfterSeconds=false) ->
    # NOTE: Kube.Message might not be initialized yet.
    unless @message
      return $(@).one('ready', => @show(text, type, hideAfterSeconds))

    @$message.html(text)

    icon = @icons[type]
    @$icon.removeAttr('class').addClass("icon-#{icon}")

    @$el.removeAttr('class').addClass("#{@namespace} #{type}")
    @message.open()

    if hideAfterSeconds?
      @timeout = setTimeout @hide, hideAfterSeconds * 1000

  showError: (text, hideAfterSeconds) ->
    @show(text, 'error', hideAfterSeconds)
