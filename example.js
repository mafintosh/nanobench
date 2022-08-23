const bench = require('./')

bench('sha1 200.000 times', function (b) {
  const crypto = require('crypto')
  let data = Buffer.from('hello world')

  b.start()

  for (let i = 0; i < 200000; i++) {
    data = crypto.createHash('sha1').update(data).digest()
  }

  b.end()
})

bench('sha256 200.000 times', function (b) {
  const crypto = require('crypto')
  let data = Buffer.from('hello world')

  b.start()

  for (let i = 0; i < 200000; i++) {
    data = crypto.createHash('sha256').update(data).digest()
  }

  b.end()
})
