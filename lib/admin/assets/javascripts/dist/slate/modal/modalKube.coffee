#= require ../../kube/Modal/Kube.Modal

Kube.Modal.prototype.originalClose = Kube.Modal.prototype.close
Kube.Modal.prototype.close = (e) ->
  if !this.$modal || !this.isOpened()
    return

  # NOTE: This is a hack to prevent closing modal when element inside of the
  #       modal is clicked.

  if $(e.target).parent().length == 0
    return

  if this.shouldNotBeClosed(e.target)
    return

  this.originalClose(e)

  if window.location.hash == "#/#{this.path}"
    if this.parentModal.closePath
      window.setLocationHash(this.parentModal.closePath)

    else
      window.setLocationHash(' ')
