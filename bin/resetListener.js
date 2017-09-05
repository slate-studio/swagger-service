'use strict'

global.C          = require('config')
const fs          = require('fs')
const rootPath    = require('app-root-path')
const service     = require('service')
const mongodb     = service.mongodb
const redis       = service.redis
const rabbitmq    = service.rabbitmq
const connect     = require('service/src/rabbitmq').connect
const serviceName = C.service.name
const spawn       = require('child_process').spawn

const resetRequestTopic  = 'resetRequests'
const resetResponseQueue = 'resetResponses'

connect(ch => {

  ch.assertExchange(resetRequestTopic, 'topic', { durable: false })

  ch.assertQueue('', { exclusive: true }, (err, q) => {
    ch.bindQueue(q.queue, resetRequestTopic, 'reset')

    ch.consume(q.queue, (message) => {
      const msg      = JSON.parse(message.content)
      const obj      = JSON.parse(msg)
      const jobId    = obj.jobId
      const services = obj.services
      const seed     = obj.seed

      const resetReponseMessage = {
        jobId: jobId,
        service: {}
      }

      if (_.includes(services, serviceName)) {

        stopService()
          .then(dropUsersSessions)
          .then(mongodb.drop)
          .then(() => {
            const seedDataPath = `${rootPath}/db/seed`

            if (fs.existsSync(seedDataPath)) {
              return require(seedDataPath)

            }
          })
          .then(() => {
            const seedTestDataPath = `${rootPath}/db/test`

            if (seed && fs.existsSync(seedTestDataPath)) {
              return require(seedTestDataPath)

            }
          })
          .then(() => {
            resetReponseMessage.service = {
              name:   serviceName,
              status: 'complete'
            }

            return rabbitmq.send(resetResponseQueue, JSON.stringify(resetReponseMessage))
          })
          .then(startService)
          .then(() => process.exit(0))
          .catch((err) => {
            resetReponseMessage.service = {
              name:   serviceName,
              status: 'error',
              error: err.toString()
            }

            rabbitmq.send(resetResponseQueue, JSON.stringify(resetReponseMessage))
              .then(startService)
              .then(() => process.exit(1))
          })
      }
    }, { noAck: false })
  })
})

function dropUsersSessions () {
  if (serviceName === 'accounts') {

    return redis()
      .then(mongodb)
      .then(() => {
        return Models.User.find({}).exec()
          .then(users => {
            const deletes = _.map(users, user => user.deleteSessions())
            return Promise.all(deletes)
          })
      })

  } else {
    return Promise.resolve()

  }
}

function stopService () {
  return new Promise((resolve, reject) => {
    const stopService = spawn('pm2', ['stop', `${serviceName}`])

    stopService.on('close', () => {
      resolve()
    })

    stopService.stderr.on('data', (data) => {
      reject(data)
    })
  })
}

function startService () {
  return new Promise((resolve, reject) => {
    const stopService = spawn('pm2', ['start', `${serviceName}`])

    stopService.on('close', () => {
      resolve()
    })

    stopService.stderr.on('data', (data) => {
      reject(data)
    })
  })
}