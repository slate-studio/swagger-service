'use strict'
const _       = require('lodash')
const request = require('request')
const fs      = require('fs')
const yaml    = require('yamljs')

const config   = yaml.load('./config/default.yaml')
const services = config.services

_.forEach(services, (service) => {
  console.log(`Updating ${service.name} spec...`)
  const serviceSpecFilePath = `./${service.spec}`
  const swaggerPath         = `http://${service.host}/swagger`
  request(swaggerPath, (error, response, body) => {
    const fileExists = fs.existsSync(serviceSpecFilePath)
    if (fileExists) {
      fs.writeFileSync(serviceSpecFilePath, body)
    } else {
      fs.writeFileSync(serviceSpecFilePath, body, { flag: 'wx' } )
    }
  })
})