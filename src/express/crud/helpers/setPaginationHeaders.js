'use strict'

module.exports = (res, page, perPage, total) => {
  const pagesCount = Math.ceil(total / perPage)

  res.setHeader('X-Page',        page)
  res.setHeader('X-Per-Page',    perPage)
  res.setHeader('X-Pages-Count', pagesCount)
  res.setHeader('X-Total-Count', total)

  if (pagesCount > page){
    res.setHeader('X-Next-Page', page + 1)
  }
}
