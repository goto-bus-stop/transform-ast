var test = require('tape')
var transform = require('../')

test('update()', function (t) {
  var source = `
    var a = 0
    a += 10
  `

  var result = transform(source, function (node) {
    if (node.type === 'Literal') node.update(String(node.value + 10))
  })

  t.is(result.toString(), `
    var a = 10
    a += 20
  `)
  t.is(
    JSON.stringify(result.map),
    '{"version":3,"file":null,"sources":["input.js"],"sourcesContent":["\\n    var a = 0\\n    a += 10\\n  "],"names":[],"mappings":"AAAA;AACA,IAAI,IAAI,CAAC,GAAG,EAAC;AACb,IAAI,CAAC,IAAI,EAAE;AACX"}'
  )
  t.end()
})

test('append/prepend()', function (t) {
  var source = `
    var a = 'hello'
  `

  var result = transform(source, function (node) {
    if (node.type === 'Literal') node.prepend('beep(').append(').boop')
  })

  t.is(result.toString(), `
    var a = beep('hello').boop
  `)
  t.is(
    JSON.stringify(result.map),
    '{"version":3,"file":null,"sources":["input.js"],"sourcesContent":["\\n    var a = \'hello\'\\n  "],"names":[],"mappings":"AAAA;AACA,IAAI,IAAI,CAAC,QAAG,aAAO;AACnB"}'
  )
  t.end()
})

test('input sourcemap', function (t) {
  t.end()
})
