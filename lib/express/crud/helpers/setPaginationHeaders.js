'use strict'

module.exports = (res, page, total, pages, perPage) => {
  res.setHeader('X-Page',        page)
  res.setHeader('X-Total-Count', total)
  res.setHeader('X-Pages-Count', pages)
  res.setHeader('X-Per-Page',    perPage)

  if (pages > page){
    res.setHeader('X-Next-Page', page + 1)
  }
}
