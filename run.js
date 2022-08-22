#!/usr/bin/env node

const path = require('path')

global.__NANOBENCH__ = require.resolve('./')

for (let i = 2; i < process.argv.length; i++) require(path.join(process.cwd(), process.argv[i]))
