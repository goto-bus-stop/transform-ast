var test = require('tape')
var transform = require('../')

test('getSource()', function (t) {
  t.plan(2)
  var source = `
    import something from 'somewhere'
    
    something.whatever()
  `

  transform(source, { sourceType: 'module' }, function (node) {
    if (node.type === 'ImportDeclaration') {
      t.is(node.source(), "import something from 'somewhere'")
      t.is(node.source.value, 'somewhere')
    }
  })

  t.end()
})
