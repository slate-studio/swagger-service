'use strict'

exports.read   = require('./read')
exports.create = require('./create')
exports.update = require('./update')
exports.delete = require('./delete')


const responses = require('../../responses')
const helpers   = require('../helpers')

exports.index = (modelName, params, sortBy, searchFields, options={}) => {
  return (req, res) => {
    helpers.setActionFilters(req, options)

    let page = req.query.page || 1
    page = Number(page)

    let perPage = req.query.perPage || 10
    perPage = Number(perPage)

    const onlyFields = req.query.only || ''

    const query = _.extend({}, req.defaultScope)

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

      // TODO: This to be change to use params.
      // arrayParams.forEach((arrayParamName) => {
      //   const arrayParamValue = req.swagger.params[arrayParamName].value

      //   // Get paramName without last character: ...Ids -> ....Id
      //   const paramName = arrayParamName.slice(0, -1)

      //   if (arrayParamValue) {
      //     query[paramName] = { $in : arrayParamValue }
      //   }
      // })
    })

    const operationId = req.swagger.operation.operationId
    log.info(operationId, query)

    const model = Model(modelName)

    req.beforeAction(query)
      .then(() => model.count(query).exec())
      .then(total => helpers.setPaginationHeaders(res, page, perPage, total))
      .then(() => model.find(query, onlyFields)
                       .sort(sortBy)
                       .skip(perPage * (page - 1))
                       .limit(perPage)
                       .lean(true)
                       .exec())
      .then(result => req.afterAction(result))
      .then(result => responses.successResponse(req, res, result))
      .catch(error => responses.applicationErrorResponse(req, res, error))
  }
}
