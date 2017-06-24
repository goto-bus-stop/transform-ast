# ast-transform

Transform an AST with source maps.
Basically @substack's [falafel](https://github.com/substack/node-falafel), but based on [magic-string][].

## Install

```bash
npm install --save ast-transform
```

## API

### `magicString = astTransform(source, opts = {}, fn)`

Parse and transform a `source` string.
`fn` will be called on each node.
The returned `magicString` is a [magic-string][] instance, with a `toString()` method to get the transformed string and a `generateMap()` method to generate a source map.

### `node.source()`

Get the source string for a node, including transformations.

### `node.update(string)`

Replace `node` with the given string.

## License

[MIT](./LICENSE)

[magic-string]: https://github.com/rich-harris/magic-string
