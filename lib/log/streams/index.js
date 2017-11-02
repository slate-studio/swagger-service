'use strict'

const _ = require('lodash')

module.exports = config => {
  const { level } = config

  const stdout  = require('./stdout')(level)
  const streams = [ stdout ]

  const firehoseConfig = _.get(config, 'firehose')
  if (firehoseConfig) {
    const firehose = require('./firehose')(level, firehoseConfig)

    streams.push(firehose)
  }

  const logstashConfig = _.get(config, 'logstash')
  if (logstashConfig) {
    const logstash = require('./logstash')(level, logstashConfig)

    streams.push(logstash)
  }

  return _.compact(streams)
}
