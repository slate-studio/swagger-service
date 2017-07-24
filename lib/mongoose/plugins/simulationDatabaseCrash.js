'use strict'

module.exports = (schema) => {

  schema.simulationDatabaseCrash = false

  schema.crushNextQuery = () => {
    schema.simulationDatabaseCrash = true
  }

  const simulateDatabaseCrash = (next, schema) => {
    if (schema.simulationDatabaseCrash) {
      schema.simulationDatabaseCrash = false
      next(new Error('Simulation of database crash'))
    } else {
      next()
    }
  }

  const operations = ['save', 'update', 'remove', 'count', 'find', 'findOne', 'findOneAndRemove', 'findOneAndUpdate', 'insertMany']
  operations.forEach((operation) => {
    schema.pre(operation, function(next) {
      simulateDatabaseCrash(next, schema)
    });
  })
}