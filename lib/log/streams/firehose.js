'use strict'

const _              = require('lodash')
const aws            = require('aws-sdk')
const bunuanFirehose = require('bunyan-firehose')

exports = module.exports = (level, config) => {
  const type = 'raw'

  const profile = _.get(config, 'credentials.profile')
  if (profile) {
    config.credentials = new aws.SharedIniFileCredentials({ profile })
  }

  if (process.env.NODE_ENV !== 'production') {
    config.buffer = { timeout: 0.5 }
  }

  const stream = bunuanFirehose.createStream(config)

  stream.on('error', (err) => {
    log.error('Firehose log error:', err)
  })

  return { type, level, stream }
}
