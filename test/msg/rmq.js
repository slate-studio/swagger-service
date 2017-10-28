'use strict'

const logger = require('../../lib/log')
const msg    = require('../../lib/msg')
const RequestNamespace = require('../../lib/requestNamespace')

const config = {
  rabbitmq: { uri: 'amqp://rabbitmq:rabbitmq@127.0.0.1:5672' },
  log: { level: 'debug' }
}

let Message, Listener, listener

describe('RabbitMQ Listener', () => {

  before(() => {
    return logger(config)
      .then(() => msg(config))
      .then(msg => {
        Message  = msg.globals.Message
        Listener = msg.globals.Listener
      })
      .then(() => log.debug('--- START TESTS ---'))
  })

  it('should listen topic', done => {
    const handlers = {
      'demo.topic': (msg, channel) => {
        // TODO: Check message content and headers.
        channel.ack(msg)
        done()
      }
    }

    listener = Listener(handlers)
    listener.listen()
      .then(() => {
        const namespace = {
          authenticationToken: 'TOKEN',
          requestId:           'REQUEST_ID'
        }

        const requestNamespace = new RequestNamespace(namespace)
        requestNamespace.save([], () => {
          const message = Message({ demo: 'data' })
          message.publish('demo.topic')
        })
      })
  })

  it('should listen to queue', done => {
    const handlers = {
      'demoQueue': (msg, channel) => {
        // TODO: Check message content and headers.
        channel.ack(msg)
        done()
      }
    }

    listener = Listener(handlers)
    listener.listen()
      .then(() => {
        const namespace = {
          authenticationToken: 'TOKEN',
          requestId:           'REQUEST_ID'
        }

        const requestNamespace = new RequestNamespace(namespace)
        requestNamespace.save([], () => {
          const message = Message({ demo: 'data' })
          message.send('demoQueue')
        })
      })
  })

})
