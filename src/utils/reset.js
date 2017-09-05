'use strict'

const RESET_REQUESTS_TOPIC = 'resetRequests'
const RESET_RESPONSE_QUEUE = 'resetResponses'

const rabbitmq = require('../rabbitmq')
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

const proc = (message, options={}) => {
  const routingKey  = message.fields.routingKey
  const messageJson = message.content.toString()
  const object      = JSON.parse(messageJson)

  const isMentioned = _.includes(object.services, C.service.name)

  if (!isMentioned) {
    return
  }

  log.info('resetRequest', messageJson)

  const _afterStop  = options.afterStop  || Promise.resolve
  const _afterDrop  = options.afterDrop  || Promise.resolve
  const _afterStart = options.afterStart || Promise.resolve

  const _seedData     = object.seed     ? seedData     : Promise.resolve
  const _seedTestData = object.seedTest ? seedTestData : Promise.resolve

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
      const responseJson = JSON.stringify({
        jobId: object.jobId,
        service: {
          name:   C.service.name,
          status: 'complete'
        }
      })

      return rabbitmq.send(RESET_RESPONSE_QUEUE, responseJson)
    })
    .then(() => {
      log.info('Request successfully processed.')
      process.exit(0)
    })
    .catch(err => {
      log.error(err)

      const responseJson = JSON.stringify({
        jobId: object.jobId,
        service: {
          name:   serviceName,
          status: 'error',
          error:  err.toString()
        }
      })

      return rabbitmq.send(RESET_RESPONSE_QUEUE, responseJson)
        .then(startService)
        .then(() => process.exit(1))
    })
}

const listen = (topic=RESET_REQUESTS_TOPIC, callback=proc) => {
  rabbitmq.connect((channel, conn) => {
    channel.assertExchange(topic, 'topic', { durable: false })
    channel.assertQueue('', { exclusive: true }, (err, q) => {
      // Receive all the messages in the topic
      channel.bindQueue(q.queue, topic, '#')
      channel.consume(q.queue, callback, { noAck: true })

      log.info(`Listening topic:${topic}`)
    })
  })
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
