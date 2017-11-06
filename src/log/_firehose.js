'use strict'

const aws = require('aws-sdk')
const bunyanFirehose = require('bunyan-firehose')

exports = module.exports = () => {
  console.info('Using firehose logs stream')

  const config = _.get(C, 'log.firehose')
  const level  = _.get(C, 'log.level', 'info')
  const type   = 'raw' // 'stream'

  const hasPriority = chunk => chunk.level >= 50
  const timeout = 0.5

  const profile = _.get(C, 'log.firehose.credentials.profile')
  if (profile) {
    config.credentials = new aws.SharedIniFileCredentials({ profile })
  }

  config.buffer = { hasPriority, timeout }

  const stream = bunyanFirehose.createStream(config)

  stream.on('error', err => console.error('Firehose log error:', err))

  return { type, level, stream }
}
