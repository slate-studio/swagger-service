'use strict'

const RESET_REQUESTS_TOPIC = 'resetRequests'
const RESET_RESPONSE_QUEUE = 'resetResponses'

const { Msg }  = require('../../future/lib/msg')
const mongodb  = require('../mongodb')
const request  = require('./request')
const spawn    = require('child_process').spawn
const fs       = require('fs')
const rootPath = require('app-root-path')

const SEED_DATA_PATH = `${rootPath}/db/seed`
const SEED_TEST_PATH = `${rootPath}/db/test`

const stopService = () => {
  log.info(`Stop ${C.service.name}`)
  const stop = spawn('pm2', [ 'stop', C.service.name ])

  return new Promise((resolve, reject) => {
    stop.stderr.on('data', (err) => reject(err))
    stop.on('close', resolve)
  })
}

const waitForService = (next) => {
  const options = {
    hostname: C.service.host,
    port:     parseInt(C.service.port),
    path:     '/health',
    method:   'GET'
  }

  request(options)
    .then(next)
    .catch(err => {
      log.info(`Waiting for ${C.service.name}...`)
      _.delay(() => waitForService(next), 2000)
    })
}

const startService = () => {
  log.info(`Start ${C.service.name}`)
  const start = spawn('pm2', ['restart', C.service.name ])

  return new Promise((resolve, reject) => {
    start.stderr.on('data', (err) => reject(err))
    start.on('close', () => waitForService(resolve))
  })
}

const seedData = () => {
  if (fs.existsSync(SEED_DATA_PATH)) {
    return require(SEED_DATA_PATH)
  }

  return Promise.resolve()
}

const seedTestData = () => {
  if (fs.existsSync(SEED_TEST_PATH)) {
    return require(SEED_TEST_PATH)
  }

  return Promise.resolve()
}

const proc = (msg, options={}) => {
  const obj   = msg.object
  const queue = RESET_RESPONSE_QUEUE

  const isMentioned = _.includes(obj.services, C.service.name)

  if (!isMentioned) {
    return
  }

  log.info('resetRequest', obj)

  const _afterStop  = options.afterStop  || Promise.resolve
  const _afterDrop  = options.afterDrop  || Promise.resolve
  const _afterStart = options.afterStart || Promise.resolve

  const _seedData     = obj.seed     ? seedData     : Promise.resolve
  const _seedTestData = obj.seedTest ? seedTestData : Promise.resolve

  return Promise.resolve()
    .then(stopService)
    .then(_afterStop)
    .then(mongodb.drop)
    .then(_afterDrop)
    .then(_seedData)
    .then(_seedTestData)
    .then(startService)
    .then(_afterStart)
    .then(() => {
      const object = {
        jobId: obj.jobId,
        service: {
          name:   C.service.name,
          status: 'complete'
        }
      }

      const message = Message(object)
      return message.send(queue)
    })
    .then(() => {
      log.info('Request successfully processed.')
      process.exit(0)
    })
    .catch(err => {
      log.error(err)

      const object = {
        jobId: obj.jobId,
        service: {
          name:   C.service.name,
          status: 'error',
          error:  err.toString()
        }
      }

      const message = Message(object)
      return message.send(queue)
        .then(startService)
        .then(() => process.exit(1))
    })
}

const listen = (topic=RESET_REQUESTS_TOPIC, callback=proc) => {
  const handlers = {}
  handlers[`${topic}.resetRequest`] = callback

  Promise.resolve()
    .then(log.setMetadata)
    .then(() => {
      const msg = new Msg(C)
      return msg.connect()
    })
    .then(({ globals }) => {
      global.Message  = globals.Message
      global.Listener = globals.Listener
    })
    .then(() => {
      const listener = Listener(handlers)
      return listener.listen()
    })
    .then(() => log.info('Reset listener started'))
}

module.exports = {
  proc:           proc,
  listen:         listen,
  stopService:    stopService,
  startService:   startService,
  seedData:       seedData,
  seedTestData:   seedTestData,
  waitForService: waitForService
}
