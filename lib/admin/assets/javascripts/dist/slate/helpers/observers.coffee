@onRenderObserver = ($el, callback) ->
  observer = new MutationObserver (mutations) ->
    mutations.forEach (mutation) ->
      if mutation.type == 'childList'
        observer.disconnect()
        callback()
      else
        console.info(mutation.type)

  el = $el.get(0)
  observer.observe(el, { childList: true })
