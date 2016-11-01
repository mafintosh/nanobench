#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var src = []

for (var i = 2; i < process.argv.length; i++) {
  src.push(fs.readFileSync(path.join(process.cwd(), process.argv[i]), 'utf-8'))
}

eval(src.join('\n')) // eslint-disable-line
