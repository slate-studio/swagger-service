// 'use strict'

// const RESET_REQUESTS_TOPIC = 'resetRequests'
// const RESET_RESPONSE_QUEUE = 'resetResponses'

// const rabbitmq = require('../rabbitmq')
// const mongodb  = require('../mongodb')
// const request  = require('./request')
// const spawn    = require('child_process').spawn
// const fs       = require('fs')

// const rootPath       = process.cwd()
// const SEED_DATA_PATH = `${rootPath}/db/seed`
// const SEED_TEST_PATH = `${rootPath}/db/test`

// const stopService = () => {
//   log.info(`Stop ${C.service.name}`)
//   const stop = spawn('pm2', [ 'stop', C.service.name ])

//   return new Promise((resolve, reject) => {
//     stop.stderr.on('data', (err) => reject(err))
//     stop.on('close', resolve)
//   })
// }

// const waitForService = (next) => {
//   const options = {
//     hostname: C.service.host,
//     port:     parseInt(C.service.port),
//     path:     '/health',
//     method:   'GET'
//   }

//   request(options)
//     .then(next)
//     .catch(err => {
//       log.info(`Waiting for ${C.service.name}...`)
//       _.delay(() => waitForService(next), 2000)
//     })
// }

// const startService = () => {
//   log.info(`Start ${C.service.name}`)
//   const start = spawn('pm2', ['restart', C.service.name ])

//   return new Promise((resolve, reject) => {
//     start.stderr.on('data', (err) => reject(err))
//     start.on('close', () => waitForService(resolve))
//   })
// }

// const seedData = () => {
//   if (fs.existsSync(SEED_DATA_PATH)) {
//     return require(SEED_DATA_PATH)
//   }

//   return Promise.resolve()
// }

// const seedTestData = () => {
//   if (fs.existsSync(SEED_TEST_PATH)) {
//     return require(SEED_TEST_PATH)
//   }

//   return Promise.resolve()
// }

// const proc = (msg, options={}) => {
//   const routingKey  = msg.fields.routingKey
//   const messageJson = msg.content.toString()
//   const message     = JSON.parse(messageJson)
//   const queue       = RESET_RESPONSE_QUEUE

//   const isMentioned = _.includes(message.services, C.service.name)

//   if (!isMentioned) {
//     return
//   }

//   log.info('resetRequest', messageJson)

//   const _afterStop  = options.afterStop  || Promise.resolve
//   const _afterDrop  = options.afterDrop  || Promise.resolve
//   const _afterStart = options.afterStart || Promise.resolve

//   const _seedData     = message.seed     ? seedData     : Promise.resolve
//   const _seedTestData = message.seedTest ? seedTestData : Promise.resolve

//   return Promise.resolve()
//     .then(stopService)
//     .then(_afterStop)
//     .then(mongodb.drop)
//     .then(_afterDrop)
//     .then(_seedData)
//     .then(_seedTestData)
//     .then(startService)
//     .then(_afterStart)
//     .then(() => {
//       const object = {
//         jobId: message.jobId,
//         service: {
//           name:   C.service.name,
//           status: 'complete'
//         }
//       }

//       return rabbitmq.send({ queue, object })
//     })
//     .then(() => {
//       log.info('Request successfully processed.')
//       process.exit(0)
//     })
//     .catch(err => {
//       log.error(err)

//       const object = {
//         jobId: message.jobId,
//         service: {
//           name:   C.service.name,
//           status: 'error',
//           error:  err.toString()
//         }
//       }

//       return rabbitmq.send({ queue, object })
//         .then(startService)
//         .then(() => process.exit(1))
//     })
// }

// const listen = (topic=RESET_REQUESTS_TOPIC, callback=proc) => {
//   const handlers = {}
//   handlers[`${topic}.#`] = callback

//   const listener = new rabbitmq.Listener({ handlers })

//   return listener.listen()
// }

// module.exports = {
//   listen:         listen,
//   proc:           proc,
//   stopService:    stopService,
//   startService:   startService,
//   seedData:       seedData,
//   seedTestData:   seedTestData,
//   waitForService: waitForService
// }
