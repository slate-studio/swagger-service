'use strict'

const rootPath = process.cwd()

module.exports = () => {
  if (C.services) {
    const EventEmitter = require('events')
    const Service      = require('../service')

    global.Services = new EventEmitter()

    Services.servicesReadyCounter = _.keys(C.services).length

    _.forEach(C.services, (config) => {
      const spec = require(`${rootPath}/${config.spec}`)
      const name = config.name

      spec.host = config.host

      const service = new Service(name, spec)

      service.on('ready', () => {
        Services.servicesReadyCounter -= 1

        if (Services.servicesReadyCounter == 0) {
          Services.emit('ready')
        }
      })

      Services[name] = service
    })
  }

  return Promise.resolve()
}
