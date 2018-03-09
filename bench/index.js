var bench = require('nanobench')
var transformAst = require('../')
var src = require('fs').readFileSync(require.resolve('acorn'), 'utf8')

bench('transform acorn × 5', function (b) {
  b.start()
  for (var i = 0; i < 5; i++)
    transformAst(src).toString()
  b.end()
})
