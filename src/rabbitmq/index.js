'use strict'

const RequestNamespace = require('../utils/requestNamespace')

const send     = require('./send')
const publish  = require('./publish')
const purge    = require('./purge')
const Listener = require('./Listener')

const setRequestNamespaceHeaders = (options, method) => {
  options.uri = options.uri || C.rabbitmq.uri

  const requestNamespace    = new RequestNamespace(options.headers)
  const authenticationToken = requestNamespace.get('authenticationToken')

  options.headers = { authenticationToken }

  if (options.timeout) {
    method(options)
    return new Promise(resolve => setTimeout(resolve, options.timeout))
  }

  return method(options)
}

module.exports = {
  Listener,
  purge,
  publish: ({ uri, topic, key, object, headers, timeout }) => {
    setRequestNamespaceHeaders({ uri, topic, key, object, headers, timeout }, publish)
  },
  send: ({ uri, queue, object, headers, timeout }) => {
    setRequestNamespaceHeaders({ uri, queue, object, headers, timeout }, send)
  }
}
