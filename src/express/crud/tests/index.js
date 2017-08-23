'use strict'

module.exports = {
  index:                require('./actions/index'),
  indexPagination:      require('./actions/indexPagination'),
  indexSearch:          require('./actions/indexSearch'),
  readById:             require('./actions/readById'),
  readByIntegerId:      require('./actions/readByIntegerId'),
  create:               require('./actions/create'),
  update:               require('./actions/update'),
  updateByIntegerId:    require('./actions/updateByIntegerId'),
  delete:               require('./actions/delete'),
  deleteByIntegerId:    require('./actions/deleteByIntegerId'),
  createError:          require('./errors/create'),
  deleteError:          require('./errors/delete'),
  deleteNotFoundError:  require('./errors/deleteNotFound'),
  readError:            require('./errors/read'),
  readNotFoundError:    require('./errors/readNotFound'),
  updateNotFoundError:  require('./errors/updateNotFound'),
  actionPath:           require('./helpers/actionPath'),
  destroyAll:           require('./helpers/destroyAll')
}
