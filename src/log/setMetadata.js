'use strict'

const os      = require('os')
const aws     = require('aws-sdk')
const request = require('../utils/request')

const getRancherEnvironment = () => {
  return new Promise((resolve) => {
    if (process.env.CLOUD_ENV) {
      return resolve(process.env.CLOUD_ENV)
    }

    const options = {
      hostname: 'rancher-metadata',
      path:     '/2015-12-19/self/stack/environment_name',
      method:   'GET',
      headers:  { 'Accept': 'application/json' }
    }

    request(options).then(res => {
      const environment = res.object
      return resolve(environment)
    })
    .catch(err => {
      const environment = 'null'
      console.error('Get Rancher environment error:', err)

      return resolve(environment)
    })
  })
}

const getAwsMetadata= () => {
  const options = {
    httpOptions: { timeout: 200 },
    maxRetries: 1
  }

  const meta = new aws.MetadataService(options)

  let metadata

  return new Promise((resolve, reject) => {
    meta.request('/latest/dynamic/instance-identity/document', (err, data) => {
      if (err) {
        return reject(err)
      }

      const object = JSON.parse(data)
      metadata = _.pick(object, [ 'privateIp',
                                  'availabilityZone',
                                  'instanceId',
                                  'instanceType',
                                  'accountId',
                                  'imageId',
                                  'region' ])

      return resolve()
    })
  })
  .then(() => {
    const region     = metadata.region
    const instanceId = metadata.instanceId

    const ec2 = new aws.EC2({ region })

    const Name    = 'resource-id'
    const Values  = [ instanceId ]
    const Filters = [ { Name, Values } ]

    return ec2.describeTags({ Filters }).promise()
  })
  .then(data => {
    metadata.tags = {}

    _.forEach(data.Tags, tag => {
      const name  = tag.Key.toLowerCase()
      const value = tag.Value

      metadata.tags[name] = value
    })

    return metadata
  })
  .catch(err => {
    console.error('Get AWS metadata error: ', err)

    return {}
  })
}

const setMetadata = () => {
  // NOTE: Here we consider non production environment to be local one. Do not
  //       make call to Rancher and AWS.
  if (process.env.NODE_ENV !== 'production') {
    C.log.metadata = { environment: os.hostname() }
    return Promise.resolve()
  }

  return Promise.all([
    getRancherEnvironment(),
    getAwsMetadata()
  ]).then(results => {
    const environment = results[0]
    const metadata    = results[1]

    metadata.environment = environment
    C.log.metadata = metadata

    return
  })
}

exports = module.exports = setMetadata
