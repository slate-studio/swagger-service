'use strict'

const bunyanUdp = require('@astronomer/bunyan-udp')

exports = module.exports = () => {
  console.info('Using logstash logs stream')

  const config = _.get(C, 'log.logstash')
  const level  = _.get(C, 'log.level', 'info')
  const stream = bunyanUdp.createStream(config)
  const type   = 'stream'

  return { type, level, stream }
}
