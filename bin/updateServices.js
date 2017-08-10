#!/usr/bin/env node

const service  = require('../index.js')
const request  = service.utils.request
const rootPath = require('app-root-path')
const fs       = require('fs')

const updateServiceSpec = (service) => {
  const [hostname, port] = service.host.split(':')

  const options = {
    hostname: hostname,
    port:     parseInt(port),
    path:     '/swagger',
    method:   'GET'
  }

  return request(options)
    .then(res => {
      const filepath    = `${rootPath}/${service.spec}`
      const version     = res.object.info.version
      const isFileFound = fs.existsSync(filepath)

      if (isFileFound) {
        log.info(`Update ${filepath} to version ${version}`)
        return fs.writeFileSync(filepath, res.body)

      } else {
        log.info(`Create ${filepath}, version ${version}`)
        return fs.writeFileSync(filepath, res.body, { flags: 'w' } )

      }
    })
    .catch(error => {
      log.error(service.name, error)
      process.exit(1)
    })
}

if (C.services) {
  const updates = _.map(C.services, updateServiceSpec)
  Promise.all(updates).then(() => log.info('DONE'))

} else {
  log.info('No services found in config/default.yaml')

}
