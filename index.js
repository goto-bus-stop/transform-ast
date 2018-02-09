var acorn = require('acorn-node')
var isBuffer = require('is-buffer')
var MagicString = require('magic-string')
var convertSourceMap = require('convert-source-map')
var mergeSourceMap = require('merge-source-map')

module.exports = function astTransform (source, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  if (typeof source === 'object' && !isBuffer(source)) {
    options = source
  }
  if (!options) options = {}
  if (options.source) {
    source = options.source
    delete options.source
  }
  if (isBuffer(source)) {
    source = source.toString('utf8')
  }

  var parse = (options.parser || acorn).parse

  var inputMap = convertSourceMap.fromSource(source)
  source = convertSourceMap.removeComments(source)
  var string = new MagicString(source, options)
  var ast = options.ast ? options.ast : parse(source, options)

  walk(ast, null, cb || function () {})

  string.inspect = string.toString
  string.walk = function (cb) {
    walk(ast, null, cb)
  }

  Object.defineProperty(string, 'map', {
    get: getSourceMap
  })

  return string

  function getSourceMap () {
    if (inputMap) inputMap = inputMap.toObject()

    var magicMap = string.generateMap({
      hires: !!inputMap,
      source: options.inputFilename || 'input.js',
      includeContent: true
    })
    
    if (inputMap) {
      return mergeSourceMap(inputMap, magicMap)
    }

    return magicMap
  }

  function walk (node, parent, cb) {
    node.parent = parent
    if (!node.edit) {
      addHelpers(node)
    }

    var keys = Object.keys(node)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      if (key === 'parent') continue
      if (Array.isArray(node[key])) {
        for (var j = 0; j < node[key].length; j++) {
          var child = node[key][j]
          if (child && typeof child.type === 'string') {
            walk(child, node, cb)
          }
        }
      } else if (node[key] && typeof node[key].type === 'string') {
        walk(node[key], node, cb)
      }
    }

    cb(node)
  }
  function addHelpers (node) {
    var edit = {
      source: function () {
        return string.slice(node.start, node.end)
      },
      update: function (replacement) {
        string.overwrite(node.start, node.end, replacement)
        return edit
      },
      append: function (append) {
        string.appendLeft(node.end, append)
        return node
      },
      prepend: function (prepend) {
        string.prependRight(node.start, prepend)
        return node
      }
    }
    node.edit = edit
    node.getSource = edit.source
    var keys = Object.keys(edit)
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i]
      if (!(k in node)) node[k] = edit[k]
    }
  }
}
