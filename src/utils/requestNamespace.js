'use strict'

const cls = require('continuation-local-storage')

const NAMESPACE_NAME = 'requestNamespace'

const clsNamespace = cls.createNamespace(NAMESPACE_NAME)
require('cls-bluebird')(clsNamespace)

class RequestNamespace {
  constructor(namespace) {
    if (namespace) {
      this.localNamespace = namespace

    } else {
      this.clsNamespace = cls.getNamespace(NAMESPACE_NAME)

    }
  }

  save(emitters=[], callback=null) {
    if (!this.localNamespace) {
      throw new Error('RequestNamespace: localNamespace is not set')
    }

    this.clsNamespace = cls.getNamespace('requestNamespace')

    _.forEach(emitters, emitter => this.clsNamespace.bindEmitter(emitter))

    this.clsNamespace.run(() => {
      this.localNamespace._keys = _.keys(this.localNamespace)

      _.forEach(this.localNamespace, (value, key) => this.clsNamespace.set(key, value))

      delete this.localNamespace._keys

      if (callback) {
        callback()
      }
    })
  }

  get(key) {
    if (this.localNamespace) {
      return this.localNamespace[key]
    }

    return this.clsNamespace.get(key)
  }

  getAll() {
    if (this.localNamespace) {
      return this.localNamespace
    }

    const keys      = this.clsNamespace.get('_keys')
    const values    = _.map(keys, key => this.clsNamespace.get(key))
    const namespace = _.zipObject(keys, values)

    return namespace
  }
}

module.exports = RequestNamespace
