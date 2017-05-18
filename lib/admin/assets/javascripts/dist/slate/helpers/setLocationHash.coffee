@setLocationHash = (href) ->
  window.history.replaceState(null, null, href)
  $(window).trigger('hashchange')

$ ->
  $(document).on 'click', 'a', (e) ->
    href = $(e.currentTarget).attr('href')

    if _.includes(href, '#//')
      e.preventDefault()

      href = href.replace('#//', '#/')
      window.setLocationHash(href)
