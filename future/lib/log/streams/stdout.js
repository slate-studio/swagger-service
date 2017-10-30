'use strict'

exports = module.exports = level => {
  const stream = process.stdout

  return { level, stream }
}
