'use strict'

module.exports = {
  successResponse: (req, res, result) => {
    res.status(200).json(result)
  },

  createdResponse: (req, res, result) => {
    res.status(201).json(result)
  },

  noContentResponse: (req, res) => {
    res.status(204).end()
  },

  badRequestResponse: (req, res, error) => {
    log.error(error)
    res.status(400).json({ errors: { message: 'Bad request' }})
  },

  notFoundResponse: (req, res) => {
    log.error('Document not found')
    res.status(404).json({ errors: { message: 'Document not Found' }})
  },

  unprocessableEntityResponse: (req, res, error) => {
    log.error(error)
    res.status(422).json({ errors: { message: 'Unprocessable entity' }})
  },

  applicationErrorResponse: (req, res, error) => {
    log.error(error)
    res.status(500).json({ errors: { message: 'Internal server error' }})
  },
}
