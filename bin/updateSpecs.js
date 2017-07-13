'use strict'

const _        = require('lodash')
const request  = require('request')
const fs       = require('fs')
const yaml     = require('yamljs')
const config   = yaml.load('./config/default.yaml')
const services = config.services

_.forEach(services, (service) => {
  console.log(`Updating ${service.name} spec...`)

  const filePath = `./${service.spec}`
  const url      = `http://${service.host}/swagger`

  request(url, (error, response, body) => {
    const isFileFound = fs.existsSync(filePath)

    if (isFileFound) {
      fs.writeFileSync(filePath, body)

    } else {
      fs.writeFileSync(filePath, body, { flag: 'wx' } )

    }
  })
})
