'use strict'

const MONGO_DOCUMENT_ID_LENGTH = 24

module.exports = (scope, id) => {
  const query = _.extend({}, scope)

  if (id.length == MONGO_DOCUMENT_ID_LENGTH) {
    query._id = id

  } else {
    query.integerId = parseInt(id)

  }

  return query
}
