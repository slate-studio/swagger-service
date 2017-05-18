@initialize = ->
  @components ||= {}
  $('*[data-component]').each (i, el) ->
    $el =$ el
    componentClassName = $el.data 'component'
    componentId        = $el.attr 'id'

    componentClass = window[componentClassName]
    unless componentClass
      console.error "#{componentClassName} is not defined in `window` scope."
      return

    if componentId && window.components[componentId]
      return

    component = new window[componentClassName]($el)
    if componentId
      window.components[componentId] = component
