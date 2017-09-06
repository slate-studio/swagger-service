'use strict'

module.exports = (modelName, data) => {
  let model   = null
  let counter = 0

  const inserts = _.map(data, (item, index) => {

    const document = item.document || item
    const options  = item.options  || {}
    model          = Model(modelName, options)

    document.integerId = document.integerId || index + 1

    const timestamp = new Date()
    document.createdAt = document.createdAt || timestamp
    document.updatedAt = document.updatedAt || timestamp

    document._deleted  = document._deleted  || false

    return model.collection.insert(document)
  })

  return Promise.all(inserts)
    .then(() => {
      if (model) {
        return model.nextCount()
          .then(currentCounter => {
            return counter = (currentCounter - 1) + data.length
          })
          .then(model.setCustomIncrementCounter)
      }
    })
    .then(() => log.info(`${modelName}`, counter))
}
