# transform-ast

Transform an AST with source maps.
Basically @substack's [falafel](https://github.com/substack/node-falafel), but based on [magic-string][].

## Example

```js
var result = require('transform-ast')(`
  var multiply = (a, b) => {
    return a * b
  }
  var add = (a, b) => a + b
`, function (node) {
  if (node.type === 'ArrowFunctionExpression') {
    var params = node.params.map(function (param) { return param.getSource() })
    if (node.body.type !== 'BlockStatement') {
      node.body.update(`{ return ${node.body.getSource()} }`)
    }
    node.update(`function (${params.join(', ')}) ${node.body.getSource()}`)
  }
})
result.toString() === `
  var multiply = function (a, b) {
    return a * b
  }
  var add = function (a, b) { return a + b }
`
fs.writeFile('output.js.map', result.generateMap().toString())
```

## Install

```bash
npm install --save transform-ast
```

## API

### `magicString = transformAst(source, opts = {}, fn)`

Parse and transform a `source` string.
`fn` will be called on each node.
The returned `magicString` is a [magic-string][] instance, with a `toString()` method to get the transformed string and a `generateMap()` method to generate a source map.

### `node.getSource()`

Get the source string for a node, including transformations.
`node.source()` also works, except with `ImportDeclaration`s which have a string `.source` property.

### `node.update(string)`

Replace `node` with the given string.

### `node.append(string)`

Append the source `string` after this node.

### `node.prepend(string)`

Prepend the source `string` before this node.

## License

[MIT](./LICENSE)

[magic-string]: https://github.com/rich-harris/magic-string
