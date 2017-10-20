'use strict'

const _ = require('lodash')

module.exports = config => {
  const { isFirehoseEnabled, isLogstashEnabled, level } = config

  const stdout  = require('./stdout')(level)
  const streams = [ stdout ]

  if (isFirehoseEnabled) {
    const firehoseConfig = _.get(config, 'firehose')
    const firehose = require('./firehose')(level, firehoseConfig)

    streams.push(firehose)
  }

  if (isLogstashEnabled) {
    const logstashConfig = _.get(config, 'logstash')
    const logstash = require('./logstash')(level, logstashConfig)

    streams.push(logstash)
  }

  return _.compact(streams)
}
