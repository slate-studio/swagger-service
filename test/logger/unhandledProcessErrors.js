// // playground
// process.on('uncaughtException', err => {

//   new Promise((resolve, reject) => {
//     log.fatal(`Uncaught exception:`, err)
//     resolve();
//   }).then(res => process.exit(1));

//   // log.info(`Uncaught exception:`, err)
//   // setImmediate(() => process.exit(1),0)

// });

// process.on('unhandledRejection', (reason, p) => {
//   log.fatal('Unhandled rejection at:', p, 'reason:', reason)
//   setImmediate(() => process.exit(1))
// })

// const somePromise = new Promise((resolve, reject) => {
//   resolve(someValue); // fulfilled
//   //  reject("failure reason"); // rejected
// });

// somePromise.then((res) => {
//     return reportToUser(JSON.pasre(res)) // note the typo (`pasre`)
//   }
// ); // no `.catch` or `.then`

// throw Error("Uncaught")
