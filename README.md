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
NANOBENCH version 2
> git checkout 7369272 && node example.js

# sha256 200.000 times
ok ~664 ms (0 s + 663775913 ns)

# sha1 200.000 times
ok ~564 ms (0 s + 563784403 ns)

# sha256 200.000 times
ok ~575 ms (0 s + 575039783 ns)

ok ~1.8 s (1 s + 802600099 ns)
```

## API

#### `benchmark(name, run)`

Add a new benchmark. `run` is called with a benchmark object, `b` that has the following methods

* `b.start()` - Start the benchmark. If not called the bench will be tracked from the beginning of the function.
* `b.end()` - End the benchmark.
* `b.error(err)` - Benchmark failed. Report error.
* `b.log(msg)` - Log out a message

#### `benchmark.skip(name, run)`

Skip a benchmark.

#### `benchmark.only(name, run)`

Only run this benchmark.

## CLI

If you have multiple benchmarks as different files you can use the cli benchmark runner to run them all

```
npm install -g nanobench
nanobench benchmarks/*.js
```

## Parser

An parser for the output format is included as well. You can require it from node using

``` js
var parse = require('nanobench/parse')
var output = parse(outputAsString)
console.log(output)
```

If you parse the above example output an object similar to this will be printed out

``` js
{ type: 'NANOBENCH',
  version: 2,
  command: 'git checkout 7369272 && nanobench example.js',
  benchmarks:
   [ { name: 'sha256 200.000 times',
       output: [],
       error: null,
       time: [Object] },
     { name: 'sha1 200.000 times',
       output: [],
       error: null,
       time: [Object] },
     { name: 'sha256 200.000 times',
       output: [],
       error: null,
       time: [Object] } ],
  error: null,
  time: [ 1, 802600099 ] }
```

## License

MIT
