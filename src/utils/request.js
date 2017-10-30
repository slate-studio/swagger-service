'use strict'

const http  = require('http')
const https = require('https')

module.exports = (options) => {
  const scheme = _.get(options, 'scheme', 'http')
  const client = scheme === 'https' ? https : http

  options.headers = options.headers || {}
  options.headers['Content-Type'] = 'application/json'

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      res.on('data', chunk => res.body = (res.body || '') + chunk)

      res.on('end', () => {
        res.object = JSON.parse(res.body)
        resolve(res)
      })
    })

    if (options.timeout) {
      req.setTimeout(options.timeout, () => req.abort())
    }

    req.on('error', reject)

    if (options.body) {
      const json   = JSON.stringify(options.body)
      const buffer = new Buffer(json)
      req.write(buffer)
    }

    req.end()
  })
}
