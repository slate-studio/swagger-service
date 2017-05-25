'use strict'

const initialize = () => {
  global._         = require('lodash')
  global._rootPath = require('app-root-path')
  global._version  = require(`${_rootPath}/package.json`).version

  require('./lib/config')
  require('./lib/logger')

  global._basePath    = C.service.basePath
  global._serviceName = C.service.name
}

const redis = () => {
  if (C.redis) {
    require('./lib/redis')
  }
}

const swaggerServices = () => {
  if (C.services) {
    global.Services = {}
    const Service = require('./lib/swagger/service')

    _.forEach(C.services, (config, projectName) => {
      const spec = require(`${_rootPath}/${config.spec}`)
      spec.host  = config.host

      Services[config.name] = new Service(config.name, spec)
    })
  }
}

const expressLog = (express) => {
  express.use((req, res, next) => {
    log.info(req.method, req.url)
    next()
  })
}

const expressHealth = (express) => {
  const health = require('./lib/express/health')

  express.get(`${_basePath}/health`, health)
}

const expressDocumentation = (express) => {
  const staticServer = require('express').static
  const assetsPath   = `${__dirname}/lib/swagger/ui/assets`
  const viewPath     = `${__dirname}/lib/swagger/ui/index.hbs`
  const serviceTitle = _.upperFirst(_serviceName)
  const swaggerUrl   = '/swagger'

  express.use(`${_basePath}/doc`, staticServer(assetsPath))
  express.get(`${_basePath}/doc`, (req, res) => {
    return res.render(viewPath, {
      title: serviceTitle,
      url:   swaggerUrl
    })
  })
}

const expressAdmin = (express) => {
  if (_.keys(C.admin).length == 0 ) {
    return
  }

  const viewPath     = `${__dirname}/lib/admin/index.hbs`
  const serviceTitle = _.upperFirst(_serviceName)
  const swaggerUrl   = '/swagger'
  const firstTag     = C.admin[_.keys(C.admin)[0]].tag

  express.get(`${_basePath}/admin/:tag`, (req, res) => {
    const tag   = req.params.tag
    const title = _.findKey(C.admin, { 'tag': tag })
    const model = C.admin[title].model

    return res.render(viewPath, {
      serviceTitle:  serviceTitle,
      url:           swaggerUrl,
      title:         title,
      tag:           tag,
      model:         model
    })
  })

  express.get(`${_basePath}/admin`, (req, res) => {
    return res.redirect(`${_basePath}/admin/${firstTag}`)
  })
}

const express = () => {
  global._crud = require('./lib/express/crud')

  const express       = require('express')()
  const bodyParser    = require('body-parser')
  const responseTime  = require('response-time')
  const connectAssets = require('connect-assets')
  const hbs           = require('hbs')

  const assets = connectAssets({
    paths: [
      `${__dirname}/lib/admin/assets/javascripts`,
      `${__dirname}/lib/admin/assets/stylesheets`
    ],
    fingerprinting: true,
    sourceMaps:     false
  })

  express.use(assets)

  hbs.registerHelper('css', function() {
    const css = assets.options.helperContext.css.apply(this, arguments)
    return new hbs.SafeString(css)
  })

  hbs.registerHelper('js', function() {
    const js = assets.options.helperContext.js.apply(this, arguments)
    return new hbs.SafeString(js)
  })

  express.set('view engine', 'hbs')
  express.use(bodyParser.json({ limit: '5mb' }))
  express.use(responseTime())

  expressLog(express)
  expressHealth(express)
  expressDocumentation(express)

  if (C.admin) {
    expressAdmin(express)
  }

  return express
}

const mongodb = (callback) => {
  const database = require('./lib/mongoose')
  database.connect(callback)
}

const listen = (express) => {
  log.info(`Listening on port ${C.service.port}`)
  express.listen(C.service.port)
}

const expressSwagger = (express) => {
  const swaggerBuilder = require('swagger-express-mw')
  const config         = require('./lib/swagger/config')

  swaggerBuilder.create(config, (err, swagger) => {
    if (err) {
      log.error('Swagger error: ', err)
      exit(1)
    }

    swagger.register(express)
    listen(express)
  })
}

const swagger = () => {
  initialize()
  redis()
  swaggerServices()

  const service = express()

  if (C.mongodb) {
    mongodb(() => {
      expressSwagger(service)
    })

  } else {
    expressSwagger(service)

  }

  return service
}

module.exports = {
  initialize:           initialize,
  redis:                redis,
  swaggerServices:      swaggerServices,
  expressLog:           expressLog,
  expressHealth:        expressHealth,
  expressDocumentation: expressDocumentation,
  expressAdmin:         expressAdmin,
  express:              express,
  mongodb:              mongodb,
  listen:               listen,
  expressSwagger:       expressSwagger,
  swagger:              swagger
}
