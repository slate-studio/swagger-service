'use strict'

const aws = require('aws-sdk')
const bunuanFirehose = require('bunyan-firehose')

exports = module.exports = () => {
  console.info('Using firehose logs stream')

  const config = _.get(C, 'log.firehose')
  const level  = _.get(C, 'log.level', 'info')
  const type   = 'raw' // 'stream'

  const profile = _.get(C, 'log.firehose.credentials.profile')
  if (profile) {
    config.credentials = new aws.SharedIniFileCredentials({ profile })
  }

  if (process.env.NODE_ENV !== 'production') {
    config.buffer = { timeout: 0.5 }
  }

  const stream = bunuanFirehose.createStream(config)

  stream.on('error', (err) => {
    console.error('Firehose log error:', err)
  })

  return { type, level, stream }
}
