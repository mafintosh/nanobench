var mutexify = require('mutexify')
var prettyHrtime = require('pretty-hrtime')
var proc = require('child_process')
var path = require('path')
var lock = mutexify()
var one = false
var cur = null
var runs = 0
var total = [0, 0]

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

function benchmark (name, fn, only) {
  process.nextTick(function () {
    if (one && !only) return
    if (runs === 0) {
      lock(function (release) {
        gitHash(function (_, hash) {
          console.log('NANOBENCH version 2\n> ' + command(hash) + '\n')
          release()
        })
      })
    }

    runs++
    lock(function (release) {
      console.log('# ' + name)

      var b = cur = {}
      var begin = process.hrtime()

      b.start = function () {
        begin = process.hrtime()
      }

      b.error = function (err) {
        cur = null
        console.log('fail ' + err.message + '\n')
        release()
      }

      b.log = function (msg) {

      }

      b.end = function (msg) {
        if (msg) b.log(msg)

        cur = null
        var time = process.hrtime(begin)

        total[0] += time[0]
        total[1] += time[1]
        while (total[1] >= 1e9) {
          total[1] -= 1e9
          total[0]++
        }

        console.log('ok ~' + prettyHrtime(time) + ' ' + rawTime(time) + '\n')
        release()
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
  console.log('ok ~' + prettyHrtime(total) + ' ' + rawTime(total) + '\n')
})

function command (hash) {
  var argv = process.argv.slice(0)
  if (argv[0] === '/usr/local/bin/node') argv[0] = 'node'
  if (argv[1] === path.join(__dirname, 'run.js')) {
    argv.shift()
    argv[0] = 'nanobench'
  }

  argv = argv.map(function (name) {
    var cwd = process.cwd() + path.sep
    return name.indexOf(cwd) === 0 ? name.slice(cwd.length) : name
  })

  return (hash ? 'git checkout ' + hash + ' && ' : '') + argv.join(' ')
}

function gitHash (cb) {
  proc.exec("git log --pretty=format:'%h' -n 1", function (err, stdout) {
    if (err) return cb(null, null)
    var hash = stdout.trim()
    if (!/[0-9a-f]/.test(hash)) return cb(null, null)
    cb(null, hash)
  })
}
