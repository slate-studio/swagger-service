class @Form
  constructor: (@$container, @options={}) ->
    @_config()

    @_buildEl()
    @_buildItems()

    @$container.append @$el

  _config: ->
    @_ = _config

    @_ 'definition'
    @_ 'scope',     {}
    @_ 'items',     {}

  _buildEl: ->
    @$el =$ "<div class='form'>"

  _buildItems: ->
    for fieldName, spec of @definition
      options       = _.extend({}, spec)
      options.form  = this
      options.name  = fieldName
      options.scope = @scope

      @items[name] = new FormItem(@$el, options)

  getFormItem: (name) ->
    @items[name]

  validate: ->
    isValid = true
    for name, formItem of @items
      unless formItem.validate()
        isValid = false

    return isValid

  populate: (@object) ->
    for name, value of @object
      @items[name]?.populate(value, @object)

  serialize: ->
    serializedObject = $.extend({}, @scope)
    for name, formItem of @items
      serializedObject[name] = formItem.value()

    return serializedObject

  reset: ->
    for name, formItem of @items
      formItem.clearError()
      formItem.populate(null)

  # TODO: Refactor this to be more generic.
  # setSubmittable: (@submittable) ->
  #   $(this).trigger('submittableChange', @submittable)
