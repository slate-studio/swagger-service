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

  let output = []

  if (_.isArray(errorsList)) {
    output = _.map(errorsList, (error) => {
      output.push(buildErrorPlainObject(error))
    })

  } else {
    output.push(buildErrorPlainObject(errorsList))

  }

  return output
}

const errorResponse = (req, res, httpError, errorsList) => {
  if (_.isArray(errorsList)) {
    _.forEach(errorsList, log.error)

  } else {
    log.error(errorsList)

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
    res.status(200).json(result)
  },

  createdResponse: (req, res, result) => {
    res.status(201).json(result)
  },

  noContentResponse: (req, res) => {
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
