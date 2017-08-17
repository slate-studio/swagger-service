'use strict'

const request = require('./request')

module.exports = () =>
{
  return new Promise((resolve) => {
    if (process.env.RANCHER_ENV) {
      return resolve(process.env.RANCHER_ENV)
    }

    if (process.env.NODE_ENV != 'production') {
      process.env.RANCHER_ENV = process.env.NODE_ENV || 'localhost'
      return resolve(process.env.RANCHER_ENV)
    }

    const options = {
      hostname: 'rancher-metadata',
      path: '/2015-12-19/self/stack/environment_name',
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    }

    request(options).then(res => {
      process.env.RANCHER_ENV = res
      return resolve(res)
    })
    .catch(err => {
      process.env.RANCHER_ENV = 'null'
      log.error(err)
      return resolve(process.env.RANCHER_ENV)
    })
  })
}
