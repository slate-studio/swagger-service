'use strict'

const start = () => {
  process.on('uncaughtException', err => {

    new Promise((resolve, reject) => {
      log.fatal(`Uncaught exception:`, err)
      resolve();
    }).then(res => process.exit(1));

  });

  process.on('unhandledRejection', (reason, p) => {
    log.fatal('Unhandled Rejection at:', p, 'reason:', reason);
    setImmediate(() => process.exit(1));
  });
}
module.exports = {
  start: start
}
