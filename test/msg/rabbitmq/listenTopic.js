'use strict'

process.env.SUPPRESS_NO_CONFIG_WARNING = true

const service  = require('../../index.js')
const Listener = service.rabbitmq.Listener
const publish  = service.rabbitmq.publish
const uri      = 'amqp://rabbitmq:rabbitmq@127.0.0.1:5672'

const handlers = {
  'workflow.demo.route': (msg, channel) => {
    console.log(msg)
    channel.ack(msg)

    console.log('Done')
    process.exit(0)
  }
}

const listener = new Listener({ uri, handlers })

listener.listen()
  .then(() => console.log('Listener ready'))
  .then(() => {
    const buildAuthenticationToken = service.utils.buildAuthenticationToken

    const topic      = 'workflow'
    const key        = 'demo.route'
    const idnId      = '1'
    const facilityId = '1'
    const token      = buildAuthenticationToken({ idnId, facilityId })
    const headers    = { 'x-authentication-token': token }
    const object     = { demo: 'data' }

    publish({ uri, topic, key, object, headers })
  })
