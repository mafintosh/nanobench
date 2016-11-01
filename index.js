var mutexify = require('mutexify')
var prettyHrtime = require('pretty-hrtime')
var lock = mutexify()
var one = false
var cur = null
var runs = 0
var total = [0, 0]

module.exports = benchmark

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
    if (runs === 0) {
      console.log('NANOBENCH version 1\n')
    }

    if (one && !only) return
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
        console.log('  fail ' + err.message)
        release()
      }

      b.end = function () {
        cur = null
        var time = process.hrtime(begin)

        total[0] += time[0]
        total[1] += time[1]
        while (total[1] >= 1e9) {
          total[1] -= 1e9
          total[0]++
        }

        console.log('  end ~' + prettyHrtime(time) + ' ' + rawTime(time))
        release()
      }

      fn(b)
    })
  })
}

process.on('exit', function () {
  if (cur) {
    cur.error(new Error('bench was never ended'))
    console.log('\n# fail\n')
    process.exit(1)
    return
  }
  console.log('\n# total ~' + prettyHrtime(total) + ' ' + rawTime(total) + '\n\n# ok\n')
})
