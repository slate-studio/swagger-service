'use strict'

const start = () => {
  process.on('uncaughtException', err => {

    new Promise((resolve, reject) => {
      log.info(`Uncaught exception:`, err)
      resolve();
    }).then(res => process.exit(1));

  });

  process.on('unhandledRejection', (reason, p) => {
    log.info('Unhandled Rejection at:', p, 'reason:', reason);
    setImmediate(() => process.exit(1));
  });
}
module.exports = {
  start: start
}
