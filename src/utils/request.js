'use strict'

const http = require('http')

module.exports = (options) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      res.on('data', chunk => res.body = (res.body || '') + chunk)

      res.on('end', () => {
        res.object = JSON.parse(res.body)
        resolve(res)
      })
    })

    req.on('error', reject)

    if (options.body) {
      req.write(options.body)
    }

    req.end()
  })
}
