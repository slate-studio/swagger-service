'use strict'

const responses            = require('../responses')
const setPaginationHeaders = require('../helpers/setPaginationHeaders')

module.exports = (model, defaultScope, params, arrayParams, sortBy, searchFields) => {
  return (req, res) => {
    let page = req.query.page || 1
    page = Number(page)

    let perPage = req.query.perPage || 10
    perPage = Number(perPage)

    const noPagination = req.query.noPagination || false

    const onlyFields = req.query.only || ''

    const query = _.extend({}, defaultScope)

    const search = req.query.search

    if (search && searchFields) {
      const searchQuery = []

      searchFields.forEach((field) => {
        const q = {}
        q[field] = { $regex: new RegExp(search), $options: 'i' }
        searchQuery.push(q)
      })

      query['$or'] = searchQuery
    }

    const includeDeleted = req.query.includeDeleted

    if (includeDeleted == '1' || includeDeleted == 'true') {
      delete query._deleted
    }

    params.forEach((paramName) => {
      const paramValue = req.query[paramName]

      if (paramValue) {
        query[paramName] = paramValue
      }
    })

    // TODO: This to be change to use params.
    arrayParams.forEach((arrayParamName) => {
      const arrayParamValue = req.swagger.params[arrayParamName].value

      // Get paramName without last character: ...Ids -> ....Id
      const paramName = arrayParamName.slice(0, -1)

      if (arrayParamValue) {
        query[paramName] = { $in : arrayParamValue }
      }
    })

    const operationId = req.swagger.operation.operationId
    log.info(operationId, query)

    if (noPagination) {
      page    = 1
      perPage = 0
    }

    model.count(query).exec()
      .then(total => setPaginationHeaders(res, page, perPage, total))
      .then(() => model.find(query, onlyFields)
                       .sort(sortBy)
                       .skip(perPage * (page - 1))
                       .limit(perPage)
                       .lean(true)
                       .exec())
      .then(result => responses.successResponse(req, res, result))
      .catch(error => responses.applicationErrorResponse(req, res, error))
  }
}
