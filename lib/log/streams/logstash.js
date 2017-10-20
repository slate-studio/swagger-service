'use strict'

const bunyanUdp = require('@astronomer/bunyan-udp')

exports = module.exports = (level, config) => {
  const type   = 'stream'
  const stream = bunyanUdp.createStream(config)

  return { type, level, stream }
}
