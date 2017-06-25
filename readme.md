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

### `node.getSource()`, `node.source()`

Get the source string for a node, including transformations.

### `node.update(string)`

Replace `node` with the given string.

### `node.append(string)`

Append the source `string` after this node.

### `node.prepend(string)`

Prepend the source `string` before this node.

## Custom Parser

You can pass in a custom parser using the `parser` option.
The parser should be an object with a `parse` function that takes a string and returns an AST.
Each AST node should have `.start` and `.end` properties indicating their position in the source string.

For example, parsing JSX using [babylon](https://github.com/babel/babylon):

```js
var babylon = require('babylon')
var transform = require('transform-ast')
var assert = require('assert')

assert.equal(transform(`
  var el = <div />;
`, { parser: babylon, plugins: [ 'jsx' ] }, function (node) {
  if (node.type === 'JSXElement') {
    node.update(JSON.stringify(node.source()))
  }
}).toString(), `
  var el = "<div />";
`)
```

But parsers for other languages too, like [tacoscript](https://tacoscript.github.io)'s parser module [horchata](https://github.com/forivall/tacoscript/tree/master/packages/horchata):

```js
var horchata = require('horchata')
var transform = require('transform-ast')
var assert = require('assert')

assert.equal(transform(`
X = () -> {
  @prop or= 'value'
}
new X
`, { parser: horchata }, function (node) {
  switch (node.type) {
  case 'FunctionExpression':
    node.update('function () ' + node.body.getSource())
  }
}).toString(), `
X = function () {
  @prop or= 'value'
}
new X
`)
```

## License

[MIT](./LICENSE)

[magic-string]: https://github.com/rich-harris/magic-string
