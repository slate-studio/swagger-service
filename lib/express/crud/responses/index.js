'use strict'

const HttpError   = require('./../../../errors/httpError')

const Http400     = require('./../../../errors/http400Error')
const Http401     = require('./../../../errors/http401Error')
const Http403     = require('./../../../errors/http403Error')
const Http404     = require('./../../../errors/http404Error')
const Http422     = require('./../../../errors/http422Error')
const Http423     = require('./../../../errors/http423Error')

const Http500     = require('./../../../errors/http500Error')
const Http502     = require('./../../../errors/http502Error')


const errorHandler = (req, res, error) => {
  switch (true) {
    case error instanceof Http400 :
      return badRequestResponse(req, res, error.name)

    case error instanceof Http401 :
      return badRequestResponse(req, res, error.name)

    case error instanceof Http403 :
      return badRequestResponse(req, res, error.name)

    case error instanceof Http404 :
      return notFoundResponse(req, res, error.name)

    case error instanceof Http422 :
      return unprocessableEntityResponse(req, res, error.name)

    case error instanceof Http423 :
      return lockedResponse(req, res, error.name)

    case error instanceof Http500 :
      return applicationErrorResponse(req, res, error.name)

    case error instanceof Http502 :
      return badGatewayResponse(req, res, error.name)

    case error instanceof HttpError :
      return errorResponse(req, res, error.getStatusCode(), error)

    default :
      return applicationErrorResponse(req, res, error)
  }
}

const customResponse = (req, res, statusCode, body) => {
  res.status(statusCode).json(body)
}


//// Successful responses ////
const successResponse = (req, res, result) => {
  customResponse(req, res, 200, result)
}

const createdResponse = (req, res, result) => {
  customResponse(req, res, 201, result)
}

const noContentResponse = (req, res) => {
  res.set('Content-Type', 'application/json').status(204).end()
}
//// Successful responses ////


//// Error responses ////
const badRequestResponse = (req, res, error) => {
  errorResponse(req, res, 400, error)
}

const unauthorizedResponse = (req, res, error) => {
  errorResponse(req, res, 401, error)
}

const forbiddenResponse = (req, res, error) => {
  errorResponse(req, res, 403, error)
}

const notFoundResponse = (req, res, error) => {
  errorResponse(req, res, 404, error)
}

const unprocessableEntityResponse = (req, res, error) => {
  errorResponse(req, res, 422, error)
}

const lockedResponse = (req, res, error) => {
  errorResponse(req, res, 423, error)
}

const applicationErrorResponse = (req, res, error) => {
  errorResponse(req, res, 500, error)
}

const badGatewayResponse = (req, res, error) => {
  errorResponse(req, res, 502, error)
}

const errorResponse = (req, res, statusCode, error) => {
  const message = (_.isObject(error) ? error.message : error)
  customResponse(req, res, statusCode, { errors: { message: message }})
}
//// Error responses ////


module.exports = {
  errorHandler,
  successResponse,
  createdResponse,
  noContentResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  unprocessableEntityResponse,
  lockedResponse,
  applicationErrorResponse,
  badGatewayResponse,
  errorResponse,
  customResponse
}
