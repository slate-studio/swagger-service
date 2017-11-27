'use strict'

const errors = require('../../errors')

const processErrorsToArrayOfPlainObjects = (errorsList) => {
  const buildErrorPlainObject = (error) => {
    if (error instanceof errors.Base) {
      return error.toPlainObject()

    } else if (error instanceof Error) {
      return {
        code:     error.code,
        message:  error.message,
        stack:    error.stack
      }

    } else {
      return {
        message:  String(error)
      }

    }
  }

  if (_.isArray(errorsList)) {
    return _.map(errorsList, (error) => buildErrorPlainObject(error))
  }

  return [ buildErrorPlainObject(errorsList) ]
}

const errorResponse = (req, res, httpError, errorsList) => {
  if (_.isArray(errorsList)) {
    _.forEach(errorsList, log.error)

  } else {
    log.error(errorsList)

  }

  if (req.timedout) {
    log.error('Request timeout, response is not sent')
    return
  }

  const errorsPlainObjects = processErrorsToArrayOfPlainObjects(errorsList)

  const statusCode = httpError.getStatusCode()
  const response   = {
    message: httpError.message,
    errors:  errorsPlainObjects
  }

  res.status(statusCode).json(response)
}

module.exports = {
  successResponse: (req, res, result) => {
    if (req.timedout) {
      log.error('Request timeout, response is not sent')
      return
    }

    res.status(200).json(result)
  },

  createdResponse: (req, res, result) => {
    if (req.timedout) {
      log.error('Request timeout, response is not sent')
      return
    }

    res.status(201).json(result)
  },

  noContentResponse: (req, res) => {
    if (req.timedout) {
      log.error('Request timeout, response is not sent')
      return
    }

    res.set('Content-Type', 'application/json').status(204).end()
  },

  badRequestResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http400()
    errorResponse(req, res, httpError, errorsList)
  },

  unauthorizedResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http401()
    errorResponse(req, res, httpError, errorsList)
  },

  forbiddenResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http403()
    errorResponse(req, res, httpError, errorsList)
  },

  notFoundResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http404()
    errorResponse(req, res, httpError, errorsList)
  },

  unprocessableEntityResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http422()
    errorResponse(req, res, httpError, errorsList)
  },

  lockedResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http423()
    errorResponse(req, res, httpError, errorsList)
  },

  applicationErrorResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http500()
    errorResponse(req, res, httpError, errorsList)
  },

  badGatewayResponse: (req, res, errorsList) => {
    const httpError = new errors.Http.Http502()
    errorResponse(req, res, httpError, errorsList)
  }
}
