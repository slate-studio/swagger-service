'use strict'

const errors = require('../../errors')

module.exports = (req, res, next) => {
  req.getSession = () => {
    return new Promise((resolve, reject) => {
      if (!req.session) {
        reject(new errors.UserSessionNotFound())
      }

      resolve(req.session)
    })
  }

  const sessionId = req.headers['x-session-id']

  if (sessionId) {
    const key = `Session ${sessionId}`

    log.info(key)

    redis.getAsync(key)
      .then(data => {
        req.session = JSON.parse(data)
        next()
      })

  } else {
    next()

  }
}
