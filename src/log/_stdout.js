'use strict'

exports = module.exports = () => {
  const stream = process.stdout
  const level  = _.get(C, 'log.level', 'info')

  return { level, stream }
}
