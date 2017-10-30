#!/usr/bin/env node

'use strict'

const fs   = require('fs')
const path = require('path')

const rootPath   = process.cwd()
const sourcePath = `${rootPath}/api/src`

const read = (dir) =>
  fs.readdirSync(dir)
    .reduce((files, file) =>
      fs.statSync(path.join(dir, file)).isDirectory() ?
        files.concat(read(path.join(dir, file))) :
        files.concat(path.join(dir, file)),
    [])

let sourceFiles = read(sourcePath)

sourceFiles = sourceFiles
  .filter(f => !f.endsWith('src/header.yaml'))
  .filter(f => !f.endsWith('src/_paths/swagger.yaml'))

const header = fs.readFileSync(`${sourcePath}/header.yaml`, 'utf8')

console.log(header)

const paths = {}

sourceFiles
  .filter(f => !f.includes('definitions'))
  .filter(f => f.endsWith('.yaml'))
  .forEach(f => {
    const lines      = fs.readFileSync(f, 'utf8').split('\n')
    const key        = '  ' + lines[0]
    const controller = '  ' + lines[1]
    const operation  = '  ' + lines.slice(2).join('\n  ')

    paths[key] = paths[key] || {}
    paths[key].controller = controller
    paths[key].operations = paths[key].operations || []
    paths[key].operations.push(operation)
  })

console.log('paths:')

Object
  .keys(paths)
  .forEach(key => {
    let obj = paths[key]
    console.log(key)
    console.log(obj.controller)

    obj.operations.forEach(operation => console.log(operation))
  })

console.log('definitions:')
sourceFiles
  .filter(f => f.includes('definitions'))
  .filter(f => f.endsWith('.yaml'))
  .forEach(f => {
    const content = fs.readFileSync(f, 'utf8').split('\n').join('\n  ')
    console.log(`  ${content}`)
  })
