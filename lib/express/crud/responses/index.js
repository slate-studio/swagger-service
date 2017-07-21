'use strict'

const errors = require('./../../../errors')

const processErrorsToArrayOfPlainObjects = (errorsList) => {
  const buildErrorPlainObject = (error) => {
    if (error instanceof errors.Base) {
      return error.toPlainObject()
    } else if (error instanceof Error) {
      return {
        code:     error.code,
        message:  error.message
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

const errorResponse = (req, res, HttpError, errorsList) => {
  log.error(errorsList)

  res.status(HttpError.getStatusCode())
    .json({ message: HttpError.message, errors: processErrorsToArrayOfPlainObjects(errorsList) })
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
    const HttpError = new errors.Http.Http400()
    errorResponse(req, res, HttpError, errorsList)
  },

  unauthorizedResponse: (req, res, errorsList) => {
    const HttpError = new errors.Http.Http401()
    errorResponse(req, res, HttpError, errorsList)
  },

  forbiddenResponse: (req, res, errorsList) => {
    const HttpError = new errors.Http.Http403()
    errorResponse(req, res, HttpError, errorsList)
  },

  notFoundResponse: (req, res, errorsList) => {
    const HttpError = new errors.Http.Http404()
    errorResponse(req, res, HttpError, errorsList)
  },

  unprocessableEntityResponse: (req, res, errorsList) => {
    const HttpError = new errors.Http.Http422()
    errorResponse(req, res, HttpError, errorsList)
  },

  lockedResponse: (req, res, errorsList) => {
    const HttpError = new errors.Http.Http423()
    errorResponse(req, res, HttpError, errorsList)
  },

  applicationErrorResponse: (req, res, errorsList) => {
    const HttpError = new errors.Http.Http500()
    errorResponse(req, res, HttpError, errorsList)
  },

  badGatewayResponse: (req, res, errorsList) => {
    const HttpError = new errors.Http.Http502()
    errorResponse(req, res, HttpError, errorsList)
  }
}