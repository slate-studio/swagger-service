'use strict'

const statuses = require('statuses')
const errors   = require('./errors')

class Base {
  constructor(modelName) {
    this.modelName     = modelName
    this.successStatus = 'OK'
    this.errorStatus   = 'Internal Server Error'
  }

  initialize() {
    return null
  }

  before() {
    return null
  }

  after() {
    return null
  }

  action() {
    return null
  }

  response() {
    const publicFields = _.chain(this.object.toObject())
      .keys().filter(key => !_.startsWith(key, '_')).value()

    return _.pick(this.object, publicFields)
  }

  success() {
    const status   = statuses(this.successStatus)
    const response = this.response()

    this.res.status(status).json(response)
  }

  error(error) {
    log.error(error)

    let status = _.get(error, 'httpStatusCode', this.errorStatus)

    if (_.isString(status)) {
      status = statuses(status)
    }

    const response = _.pick(error, [ 'name', 'message', 'stack', 'errors' ])
    this.res.status(status).json(response)
  }

  exec(req, res) {
    this.req = req
    this.res = res

    return Promise.resolve()
      .then(() => this.initialize())
      .then(() => this.before())
      .then(() => this.action())
      .then(() => this.after())
      .then(() => this.success())
      .catch(error => this.error(error))
  }
}

class Create extends Base {
  initialize() {
    this.successStatus = 'Created'
    this.errorStatus   = 'Unprocessable Entity'

    this.parameters = this.req.body
  }

  action() {
    const model = Model(this.modelName)

    this.object = new model(this.parameters)

    return this.object.save()
  }
}

class Read extends Base {
  initialize() {
    const { id: integerId } = this.req.swaggerParameters
    this.query = { integerId }
  }

  action() {
    const model = Model(this.modelName)

    return model.findOne(this.query).exec()
      .then(object => {
        if (!object) {
          throw new errors.DocumentNotFoundError(this.modelName, this.query)
        }

        this.object = object
      })
  }
}

class Update extends Base {
  initialize() {
    const { id: integerId } = this.req.swaggerParameters
    this.query      = { integerId }
    this.parameters = this.req.body
  }

  action() {
    const model = Model(this.modelName)

    return model.findOneAndUpdate(this.query, this.parameters, { new: true }).exec()
      .then(object => {
        if (!object) {
          throw new errors.DocumentNotFoundError(this.modelName, this.query)
        }

        this.object = object
      })
  }
}

module.exports = { Base, Create, Read, Update } // Index, Delete
