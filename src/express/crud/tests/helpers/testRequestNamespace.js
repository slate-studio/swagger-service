'use strict'

let context   = {}

let namespace = {
  get: (name) => {
    return context[name] || null
  }
}

const createNamespace = (idnId, facilityId) => {
  context = {
    idnId:      idnId,
    facilityId: facilityId
  }
  return namespace
}

const getNamespace = () => {
  return namespace
}

module.exports = {
  createNamespace,
  getNamespace
}
