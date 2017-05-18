class @AdminModal extends Modal
  _config: ->
    super()

    @_ 'model'
    @_ 'scope', {}

    @re = '^new$|^.{24}$|^\\d+$'

  _render: (path) ->
    @isNew      = path == 'new'
    @objectId   = path
    @modelField = _.camelCase(@model)
    @definition = api.getDefinition("#{@model}Input")

    @_updateTitle()
    @_buildContentLayout()
    @_buildForm()
    @_bindEventsAfterRender()

    @modal.setContent(@$layout)

  _updateTitle: ->
    title = "Update #{@model}"
    if @isNew
      title = "Create #{@model}"
    @$title.html(title)

  _buildContentLayout: ->
    @$layout =$ """<div class='admin-modal'>
        <section class='_form'></section>
        <footer>
          <button class='button _create hide'>Create</button>
          <button class='button _update hide'>Update</button>
          <a class='button outline' href='#//'>Cancel</a>

          <button class='_delete button secondary float-right'>Delete</button>
        </footer>
      </div>"""

    @$form   = @$layout.find '._form'
    @$create = @$layout.find '._create'
    @$update = @$layout.find '._update'
    @$delete = @$layout.find '._delete'

    if @isNew
      if api.getOperation("create#{@model}")
        @$create.removeClass('hide')

    else
      if api.getOperation("update#{@model}")
        @$update.removeClass('hide')

  _buildForm: ->
    options =
      definition: @definition
      scope:      @scope

    @form = new Form(@$form, options)

    unless @isNew
      params = { id: @objectId }
      api.send "read#{@model}ById", params, (success) =>
        @form.populate(success.obj)

  _bindEventsAfterRender: ->
    @$create.on 'click', @_create
    @$update.on 'click', @_update
    @$delete.on 'click', @_delete

  _onSuccess: =>
    window.location.hash = '#/'

  _onError: =>
    $.noop()

  _create: =>
    return unless @form.validate()
    params = {}
    params[@modelField] = @form.serialize()
    api.send("create#{@model}", params, @_onSuccess, @_onError)

  _update: =>
    return unless @form.validate()
    params = { id: @objectId }
    params[@modelField] = @form.serialize()
    api.send("update#{@model}", params, @_onSuccess, @_onError)

  _delete: =>
    params = { id: @objectId }
    api.send("delete#{@model}", params, @_onSuccess, @_onError)
