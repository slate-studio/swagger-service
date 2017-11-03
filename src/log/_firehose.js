'use strict'

const aws = require('aws-sdk')
const bunuanFirehose = require('bunyan-firehose')

exports = module.exports = () => {
  console.info('Using firehose logs stream')

  const config = _.get(C, 'log.firehose')
  const level  = _.get(C, 'log.level', 'info')
  const type   = 'raw' // 'stream'

  const hasPriority = function (chank) {
    return (chank.level >= 50)
  }

  const profile = _.get(C, 'log.firehose.credentials.profile')
  if (profile) {
    config.credentials = new aws.SharedIniFileCredentials({ profile })
  }

  config.buffer = { hasPriority }

  if (process.env.NODE_ENV !== 'production') {
    config.buffer = _.assign(config.buffer, { timeout: 0.5 })
  }

  const stream = bunuanFirehose.createStream(config)

  stream.on('error', (err) => {
    console.error('Firehose log error:', err)
  })

  return { type, level, stream }
}
