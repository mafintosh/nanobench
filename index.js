const mutexify = require('mutexify')
const prettyHrtime = require('pretty-hrtime')
const path = require('path')
const lock = mutexify()
let one = false
let cur = null
let runs = 0
const total = [0, 0]

module.exports = global.__NANOBENCH__ ? require(global.__NANOBENCH__) : benchmark

benchmark.only = function (name, fn) {
  if (one) throw new Error('Only a single "only" benchmark can be specified')
  one = true
  benchmark(name, fn, true)
}

benchmark.skip = function (name, fn) {}

function rawTime (hr) {
  return '(' + hr[0] + ' s + ' + hr[1] + ' ns)'
}

function toMillis (hr) {
  return hr[0] * 1e3 + hr[1] / 1e6
}

function benchmark (name, fn, only) {
  process.nextTick(function () {
    if (one && !only) return
    if (runs === 0) {
      console.log('NANOBENCH version 2\n> ' + command() + '\n')
    }

    runs++
    lock(function (release) {
      console.log('# ' + name)

      const b = cur = {}
      let begin = process.hrtime()

      b.start = function () {
        begin = process.hrtime()
      }

      b.error = function (err) {
        cur = null
        console.log('fail ' + err.message + '\n')
        release()
      }

      b.log = function (msg) {
        console.log('# ' + msg)
      }

      b.elapsed = function () {
        return toMillis(process.hrtime(begin))
      }

      b.end = function (msg) {
        if (msg) b.log(msg)

        cur = null
        const elapsed = process.hrtime(begin)

        total[0] += elapsed[0]
        total[1] += elapsed[1]
        while (total[1] >= 1e9) {
          total[1] -= 1e9
          total[0]++
        }

        console.log('ok ~' + prettyHrtime(elapsed) + ' ' + rawTime(elapsed) + '\n')
        release()
        return toMillis(elapsed)
      }

      fn(b)
    })
  })
}

process.on('exit', function () {
  if (cur) {
    cur.error(new Error('bench was never ended'))
    console.log('fail\n')
    return
  }
  console.log('all benchmarks completed')
  console.log('ok ~' + prettyHrtime(total) + ' ' + rawTime(total) + '\n')
})

function command () {
  let argv = process.argv.slice(0)
  if (argv[0] === '/usr/local/bin/node') argv[0] = 'node'
  if (argv[1] === path.join(__dirname, 'run.js')) {
    argv.shift()
    argv[0] = 'nanobench'
  }

  argv = argv.map(function (name) {
    const cwd = process.cwd() + path.sep
    return name.indexOf(cwd) === 0 ? name.slice(cwd.length) : name
  })

  return argv.join(' ')
}
