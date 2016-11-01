# nanobench

Simple benchmarking tool with TAP-like output that is easy to parse.

```
npm install nanobench
```

## Usage

``` js
var bench = require('nanobench')

bench('sha256 200.000 times', function (b) {
  var crypto = require('crypto')
  var data = new Buffer('hello world')

  b.start()

  for (var i = 0; i < 200000; i++) {
    data = crypto.createHash('sha256').update(data).digest()
  }

  b.end()
})

bench('sha1 200.000 times', function (b) {
  var crypto = require('crypto')
  var data = new Buffer('hello world')

  b.start()

  for (var i = 0; i < 200000; i++) {
    data = crypto.createHash('sha1').update(data).digest()
  }

  b.end()
})

bench('sha256 200.000 times', function (b) {
  var crypto = require('crypto')
  var data = new Buffer('hello world')

  b.start()

  for (var i = 0; i < 200000; i++) {
    data = crypto.createHash('sha256').update(data).digest()
  }

  b.end()
})
```

Running the above will produce output similar to this:

```
NANOBENCH version 1

# sha256 200.000 times
  end ~568 ms (0 s + 568372106 ns)
# sha1 200.000 times
  end ~550 ms (0 s + 550049856 ns)
# sha256 200.000 times
  end ~591 ms (0 s + 591365175 ns)

# total ~1.71 s (1 s + 709787137 ns)

# ok
```

## API

#### `benchmark(name, run)`

Add a new benchmark. `run` is called with a benchmark object, `b` that has the following methods

* `b.start()` - Start the benchmark. If not called the bench will be tracked from the beginning of the function.
* `b.end()` - End the benchmark.
* `b.error(err)` - Benchmark failed. Report error.

#### `benchmark.skip(name, run)`

Skip a benchmark.

#### `benchmark.only(name, run)`

Only run this benchmark.

## CLI

If you have multiple benchmarks as different files you can use the cli benchmark runner
to run them all

```
npm install -g nanobench
nanobench benchmarks/*.js
```

## License

MIT
