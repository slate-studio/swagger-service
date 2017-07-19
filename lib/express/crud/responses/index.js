'use strict'

const errors = require('./../../../errors')

const parseErrors = (errorsList) => {
  const parse = (error) => {
    if (error instanceof errors.Base) {
      return error.render()
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
      output.push(parse(error))
    })
  } else {
    output.push(parse(errorsList))
  }
  return output
}

const customResponse = (req, res, statusCode, body) => {
  res.status(statusCode).json(body)
}

const errorResponse = (req, res, statusCode, basicError, nestedErrors) => {
  customResponse(req, res, statusCode, { message: basicError.message, errors: parseErrors(nestedErrors)})
}

module.exports = {

  customResponse: customResponse,
  errorResponse:  errorResponse,

  successResponse: (req, res, result) => {
    customResponse(req, res, 200, result)
  },

  createdResponse: (req, res, result) => {
    customResponse(req, res, 201, result)
  },

  noContentResponse: (req, res) => {
    res.set('Content-Type', 'application/json').status(204).end()
  },

  badRequestResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http400()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  },

  unauthorizedResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http401()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  },

  forbiddenResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http403()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  },

  notFoundResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http404()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  },

  unprocessableEntityResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http422()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  },

  lockedResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http423()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  },

  applicationErrorResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http500()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  },

  badGatewayResponse: (req, res, nestedErrors) => {
    const basicError = new errors.Http.Http502()
    errorResponse(req, res, basicError.getStatusCode(), basicError, nestedErrors)
  }
}