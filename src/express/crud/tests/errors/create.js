'use strict'

module.exports = (done, modelName, uniqueParams) => {
  factory.create(modelName, uniqueParams).then(() => {
    factory.attrs(modelName).then((params) => {
      _.extend(params, uniqueParams)

      const path = actionPath(modelName)

      request(service)
        .post(path)
        .set('Accept', 'application/json')
        .send(params)
          .expect('Content-Type', /json/)
          .expect(400, done)
    })
  })
}
