#!/usr/bin/env node

const fs = require('fs')
const prettyHrtime = require('pretty-hrtime')
const chalk = require('chalk')
const parse = require('./parse')

const grace = 0.05 // 5% grace
const a = parse(fs.readFileSync(process.argv[2]))
const b = parse(fs.readFileSync(process.argv[3]))

const upper = 1 + grace
const lower = 1 - grace

const mapA = toMap(a)
const mapB = toMap(b)
const list = []

a.benchmarks.forEach(function (bench) {
  compareBench(bench, mapB)
})

b.benchmarks.forEach(function (bench) {
  compareBench(bench, mapA)
})

write('NANOBENCH version 2', '|', 'NANOBENCH version 2')
write('> ' + a.command, '|', '> ' + b.command)
write('', '|', '')

list.forEach(function (bench) {
  let left = bench
  let right = bench.other

  if (mapB[left.name] === left) {
    const tmp = left
    left = right
    right = tmp
  }

  let sep = '='
  if (left.winner) sep = '<'
  if (right && right.winner) sep = '>'

  write('# ' + left.name, sep, right && '# ' + right.name)

  const len = Math.max(left.output.length, right ? right.output.length : 0)
  for (let i = 0; i < len; i++) {
    write(left.output[i] && '# ' + left.output[i], sep, right.output[i] && '# ' + right.output[i])
  }

  write(result(left), sep, result(right))
  write('', '|', '')
})

const last = compare(a.time, b.time)
const sep = last === 1 ? '>' : last === -1 ? '<' : '='

write('all benchmarks completed', sep, 'all benchmarks completed')
write(result(a), sep, result(b))
write('', '|', '')

function result (b) {
  if (!b) return ''
  if (b.error) return 'fail ' + b.error
  return 'ok ~' + prettyHrtime(b.time) + ' ' + rawTime(b.time)
}

function write (a, sep, b) {
  if (!b) b = ''
  while (a.length < 33) a += ' '

  if (sep === '|') {
    sep = ' | '
    a = chalk.gray(a)
    b = chalk.gray(b)
  }
  if (sep === '<') {
    sep = '<<<'
    a = chalk.green(a)
    b = chalk.red(b)
  }
  if (sep === '>') {
    sep = '>>>'
    a = chalk.red(a)
    b = chalk.green(b)
  }
  if (sep === '=') sep = '==='

  console.log(a + sep + '   ' + b)
}

function compareBench (bench, map) {
  const other = map[bench.name]
  if (!other) return
  if (list.indexOf(other) > -1) return

  const cmp = compare(bench.time, other.time)

  bench.other = other
  list.push(bench)

  let winner = null
  if (cmp === 1) winner = other
  if (cmp === -1) winner = bench

  const loser = winner === bench ? other : bench

  if (winner) {
    winner.winner = true
    loser.loser = true
  }
}

function compare (a, b) {
  const pct = (a[0] * 1e9 + a[1]) / (b[0] * 1e9 + b[1])
  if (pct > upper) return 1
  if (pct < lower) return -1
  return 0
}

function toMap (output) {
  const map = {}
  output.benchmarks.forEach(function (b) {
    map[b.name] = b
  })
  return map
}

function rawTime (hr) {
  return '(' + hr[0] + ' s + ' + hr[1] + ' ns)'
}
