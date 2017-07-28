'use strict'

const mongoose      = require('mongoose')
const async         = require('async')
const should        = require('chai').should()
const autoIncrement = require('./../../../lib/mongoose/plugins/autoIncrement')

afterEach(done => {
  mongoose.model('User').collection.drop(() => {
    delete mongoose.models.User
    mongoose.model('IdentityCounter').collection.drop(done)
  })
})

describe('mongoose-auto-increment', () => {

  it('should increment the _id field on save', done => {

    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    })
    userSchema.plugin(autoIncrement, 'User')

    const User  = mongoose.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    const assert = (err, results) => {
      should.not.exist(err)
      results.user1[0].should.have.property('_id', 0)
      results.user2[0].should.have.property('_id', 1)
      done()
    }

    async.series(
      {
        user1: cb => user1.save(cb),
        user2: cb => user2.save(cb)
      },
      assert
    )

  })

  it('should increment the specified field instead (Test 2)', done => {

    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    })
    userSchema.plugin(autoIncrement, { model: 'User', field: 'userId' })

    const User  = mongoose.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    const assert = (err, results) => {
      should.not.exist(err)
      results.user1[0].should.have.property('userId', 0)
      results.user2[0].should.have.property('userId', 1)
      done()
    }

    async.series(
      {
        user1: cb => user1.save(cb),
        user2: cb => user2.save(cb)
      },
      assert
    )

  })


  it('should start counting at specified number (Test 3)', done => {

    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    })
    userSchema.plugin(autoIncrement, { model: 'User', startAt: 3 })

    const User  = mongoose.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    const assert = (err, results) => {
      should.not.exist(err)
      results.user1[0].should.have.property('_id', 3)
      results.user2[0].should.have.property('_id', 4)
      done()
    }

    async.series(
      {
        user1: cb => user1.save(cb),
        user2: cb => user2.save(cb)
      },
      assert
    )

  })

  it('should increment by the specified amount (Test 4)', done => {

    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    });

    (function() {
      userSchema.plugin(autoIncrement)
    }).should.throw(Error)

    userSchema.plugin(autoIncrement, { model: 'User', incrementBy: 5 })

    const User = mongoose.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    const assert = (err, results) => {
      should.not.exist(err)
      results.user1[0].should.have.property('_id', 0)
      results.user2[0].should.have.property('_id', 5)
      done()
    }

    async.series(
      {
        user1: cb => user1.save(cb),
        user2: cb => user2.save(cb)
      },
      assert
    )

  })


  describe('helper function', () => {

    it('nextCount should return the next count for the model and field (Test 5)', done => {

      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      })
      userSchema.plugin(autoIncrement, 'User')

      const User = mongoose.model('User', userSchema)
      const user1 = new User({ name: 'Charlie', dept: 'Support' })
      const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

      const assert = (err, results) => {
        should.not.exist(err)
        results.count1.should.equal(0)
        results.user1[0].should.have.property('_id', 0)
        results.count2.should.equal(1)
        results.user2[0].should.have.property('_id', 1)
        results.count3.should.equal(2)
        done()
      }

      async.series(
        {
          count1: cb => user1.nextCount(cb),
          user1:  cb => user1.save(cb),
          count2: cb => user1.nextCount(cb),
          user2:  cb => user2.save(cb),
          count3: cb => user2.nextCount(cb)
        },
        assert
      )

    })

    it('resetCount should cause the count to reset as if there were no documents yet.', done => {

      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      })
      userSchema.plugin(autoIncrement, 'User')

      const User = mongoose.model('User', userSchema)
      const user = new User({name: 'Charlie', dept: 'Support'})

      const assert = (err, results) => {
        should.not.exist(err)
        results.user[0].should.have.property('_id', 0)
        results.count1.should.equal(1)
        results.reset.should.equal(0)
        results.count2.should.equal(0)
        done()
      }

      async.series(
        {
          user:   cb => user.save(cb),
          count1: cb => user.nextCount(cb),
          reset:  cb => user.resetCount(cb),
          count2: cb => user.nextCount(cb)
        },
        assert
      )

    })

  })
})
