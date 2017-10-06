'use strict'

module.exports = (req, res, next) => {
  const method = req.method
  const path   = req.url

  log.info(method, path)

  next()
}

// const errors = require('../../errors')

// module.exports = (req, res, next) => {
//   req.getSession = () => {
//     return new Promise((resolve, reject) => {
//       if (!req.session) {
//         reject(new errors.UserSessionNotFound())
//       }

//       resolve(req.session)
//     })
//   }

//   const sessionId = req.requestNamespace.get('sessionId')

//   if (sessionId) {
//     const key = `Session ${sessionId}`

//     log.info(key)

//     redis.getAsync(key)
//       .then(data => {
//         req.session = JSON.parse(data)
//         next()
//       })

//   } else {
//     next()

//   }
// }
