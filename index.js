'use strict'

const cls = require('continuation-local-storage')

const initialize = () => {
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
    const EventEmitter = require('events')
    global.Services = new EventEmitter()
    Services.servicesReadyCounter = _.keys(C.services).length

    const Service = require('./lib/swagger/service')

    _.forEach(C.services, (config) => {
      const spec = require(`${_rootPath}/${config.spec}`)
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
}

const expressLogRequests = express => {
  express.use((req, res, next) => {
    const requestId = req.headers['x-request-id']
    const method    = req.method
    const path      = req.url

    log.info({ requestId: requestId }, `${method} ${path}`)

    const namespace = cls.getNamespace('loggerNamespace')

    namespace.bindEmitter(req)
    namespace.bindEmitter(res)

    namespace.run(() => {
      namespace.set('requestId', requestId)
      next()
    })
  })
}

const expressHealth = (express) => {
  const health = require('./lib/express/health')
  const cors   = require('cors')

  if (process.env.NODE_ENV == 'production') {
    express.get(`${_basePath}/health`, health)

  } else {
    express.get(`${_basePath}/health`, cors(), health)

  }
}

const expressDocumentation = (express) => {
  const staticServer = require('express').static
  const assetsPath   = `./node_modules/swagger-ui-dist`
  const viewPath     = `${__dirname}/lib/swagger/ui/index.hbs`
  const serviceTitle = _.upperFirst(_serviceName)
  const swaggerUrl   = '/swagger'

  express.get(`${_basePath}/doc`, (req, res) => {
    return res.render(viewPath, {
      title: serviceTitle,
      url:   swaggerUrl
    })
  })

  express.use(`${_basePath}/doc`, staticServer(assetsPath))
}

const expressAdmin = (express) => {
  if (_.keys(C.admin).length == 0 ) {
    return
  }

  const staticServer = require('express').static
  const assetsPath   = `./node_modules/swagger-admin/dist`
  const viewPath     = `${__dirname}/lib/admin/index.hbs`
  const serviceTitle = _.upperFirst(_serviceName)
  const swaggerUrl   = '/swagger'
  const firstTag     = C.admin[_.keys(C.admin)[0]].tag

  express.use(`${_basePath}/admin`, staticServer(assetsPath))

  express.get(`${_basePath}/admin/:tag`, (req, res) => {
    const tag   = req.params.tag
    const title = _.findKey(C.admin, { 'tag': tag })
    const model = C.admin[title].model

    return res.render(viewPath, {
      serviceTitle: serviceTitle,
      url:          swaggerUrl,
      title:        title,
      tag:          tag,
      model:        model
    })
  })

  express.get(`${_basePath}/admin`, (req, res) => {
    return res.redirect(`${_basePath}/admin/${firstTag}`)
  })
}

const expressErrorHandler = express => {
  express.use((err, req, res, next) => {
    log.error(err)

    const errorPlainObject = {
      message: err.message,
      name:    err.name,
      stack:   err.stack
    }

    const response = {
      message: 'Internal application error',
      errors:  [ errorPlainObject ]
    }

    res.status(500).json(response)
  })
}

const express = () => {
  global._crud = require('./lib/express/crud')

  const express      = require('express')()
  const responseTime = require('response-time')

  express.use(responseTime())

  expressLogRequests(express)
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

const expressSwagger = (express, callback) => {
  const swaggerBuilder = require('swagger-express-mw')
  const config         = require('./lib/swagger/config')

  swaggerBuilder.create(config, (err, swagger) => {
    if (err) {
      log.error('Swagger error: ', err)
      exit(1)
    }

    swagger.register(express)

    expressErrorHandler(express)

    listen(express)

    if (callback) {
      callback()
    }
  })
}

const swagger = (callback) => {
  initialize()
  redis()
  swaggerServices()

  const service = express()

  if (C.mongodb) {
    mongodb(() => {
      expressSwagger(service, callback)
    })

  } else {
    expressSwagger(service, callback)
  }

  return service
}

module.exports = {
  initialize:           initialize,
  redis:                redis,
  swaggerServices:      swaggerServices,
  expressLogRequests:   expressLogRequests,
  expressHealth:        expressHealth,
  expressDocumentation: expressDocumentation,
  expressAdmin:         expressAdmin,
  expressErrorHandler:  expressErrorHandler,
  express:              express,
  mongodb:              mongodb,
  listen:               listen,
  expressSwagger:       expressSwagger,
  swagger:              swagger
}
