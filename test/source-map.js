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
    JSON.stringify(result.generateMap({ hires: true })),
    '{"version":3,"file":null,"sources":[null],"sourcesContent":[null],"names":[],"mappings":"AAAA;AACA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,EAAC;AACb,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE;AACX,CAAC"}'
  )
  t.end()
})
