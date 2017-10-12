'use strict'

module.exports = {
  responseTime: require('response-time'),
  errors:       require('./errors'),
  actions:      require('./actions'),
  client:       require('./client'),
  health:       require('./health'),
  namespace:    require('./namespace'),
  oas:          require('./oas')
}
