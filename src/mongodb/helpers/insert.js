'use strict'

module.exports = (modelName, data) => {
  const counter = data.length

  log.info(`${modelName}:`, counter)

  const model   = Models[modelName]
  const inserts = _.map(data, (document, index) => {
    document.integerId = document.integerId || index + 1

    const timestamp = new Date()
    document.createdAt = document.createdAt || timestamp
    document.updatedAt = document.updatedAt || timestamp

    document._deleted  = document._deleted  || false

    return model.collection.insert(document)
  })

  return Promise.all(inserts)
    .then(() => model.setCustomIncrementCounter(counter))
}
