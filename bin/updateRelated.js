'use strict'

const _          = require('lodash')
const fs         = require('fs')
const yaml       = require('yamljs')
const request    = require('request')
const service    = yaml.load('./config/default.yaml').service
const name       = service.name
const host       = service.host
const port       = service.port
const serviceUrl = `http://${host}:${port}/swagger`
const update     = process.env.UPDATE_SERVICES

const services = [
  'he-storage',
  'he-import',
  'he-staff',
  'he-census',
  'he-schedule',
  'he-schedule-snapshots',
  'he-schedule-payload',
  'he-accounts',
  'he-permissions',
  'he-auth-gate',
  'he-core',
  'he-reports',
  'he-workflow',
  'he-email',
  'he-notifications',
  'he-push-notifications',
  'he-timesheets',
  'he-open-shifts',
  'he-surveys',
]

const pullServiceSpec = (callback) => {
  request(serviceUrl, (error, response, body) => {
    callback(body)
  })
}

const writeFile = (filePath, content) => {
  const isFileFound = fs.existsSync(filePath)

  if (isFileFound) {
    fs.writeFileSync(filePath, content)

  } else {
    fs.writeFileSync(filePath, content, { flag: 'wx' } )
  }
}

pullServiceSpec( (spec) => {
  _.forEach(services, (service) => {


    const config = yaml.load(`../${service}/config/default.yaml`)
    const relatedServices = config.services

    _.forEach(relatedServices, (s) => {

      if (s.name == name) {
        const filePath = `../${service}/${s.spec}`

        if (update == 'true') {
          console.log(`Updating spec for ${service}`)
          writeFile(filePath, spec)
        } else {
          console.log(service)
        }
      }
    })
  })
})

