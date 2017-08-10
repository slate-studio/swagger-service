#!/usr/bin/env node

require('../')
  .mongodb.drop()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
