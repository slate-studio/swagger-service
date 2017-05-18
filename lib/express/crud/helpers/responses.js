'use strict'

const notFoundResponse = (res) => {
  log.error('Document not found')
  res.status(404).json({ errors: { message: 'Document not Found' }})
}

const errorResponse = (res, err) => {
  log.error(err)
  res.status(400).json({ errors: { message: 'Bad request' }})
}

const createResponse = (res, err, object) => {
  if (err)
    return errorResponse(res, err)

  res.status(201).json(object)
}

const deleteResponse = (res, err, object) => {
  if (err)
    return errorResponse(res, err)

  if (object)
    return res.status(204).end()

  notFoundResponse(res)
}

const updateResponse = (res, err, object) => {
  if (err)
    return errorResponse(res, err)

  if (object)
    return res.status(200).json(object)

  notFoundResponse(res)
}

const readResponse = updateResponse

module.exports = {
  errorResponse:    errorResponse,
  notFoundResponse: notFoundResponse,
  updateResponse:   updateResponse,
  readResponse:     readResponse,
  deleteResponse:   deleteResponse,
  createResponse:   createResponse
}
