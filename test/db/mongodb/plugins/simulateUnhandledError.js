'use strict'

const simulateUnhandledError = 
  require('../../../lib/db/mongodb/plugins/simulateUnhandledError')

describe('simulateUnhandledError', () => {

  afterEach(done => {
    delete mongoose.models.Test
    done()
  })

  it('should save without error', done => {
    const testSchema = new mongoose.Schema({ field: String })

    testSchema.plugin(simulateUnhandledError)

    const Test  = mongoose.model('Test', testSchema)

    const test1 = new Test({ field: 'field1' })

    Promise.resolve()
      .then(() => test1.save())
      .then(() => done())
      .catch(() => done('There was an error while saving'))
  })

  it('should raise exception while saving', done => {
    const testSchema = new mongoose.Schema({ field: String })

    testSchema.plugin(simulateUnhandledError)

    const Test  = mongoose.model('Test', testSchema)
    Test.schema.simulateUnhandledError()

    const test1 = new Test({ field: 'field1' })

    Promise.resolve()
      .then(() => test1.save())
      .then(() => done('No raise `UnhandledError` exception'))
      .catch(() => done())
  })

  it('should raise exception during the second save', done => {
    const testSchema = new mongoose.Schema({ field: String })

    testSchema.plugin(simulateUnhandledError)

    const Test  = mongoose.model('Test', testSchema)
    Test.schema.simulateUnhandledError(2)

    const test1 = new Test({ field: 'field1' })
    const test2 = new Test({ field: 'field2' })

    Promise.resolve()
      .then(() => {
        return test1.save()
          .then(test => test.should.have.property('field', 'field1'))
      })
      .then(() => {
        return test2.save()
          .then(() => done('No raise `UnhandledError` exception'))
          .catch((err) => done())
      })
      .catch(() => done('There was an error while saving'))
  })

})
