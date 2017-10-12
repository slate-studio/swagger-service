'use strict'

const { isFirehoseEnabled, isLogstashEnabled } = _.get(C, 'log', {})

const stdout  = require('./stdout')()
const streams = [ stdout ]

if (isFirehoseEnabled) {
  const firehose = require('./firehose')()
  streams.push(firehose)
}

if (isLogstashEnabled) {
  const logstash = require('./logstash')()
  streams.push(logstash)
}

module.exports = _.compact(streams)
