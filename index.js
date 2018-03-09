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

  walk(ast, null, function (node) {
    string.addSourcemapLocation(node.start)
    string.addSourcemapLocation(node.end)
    if (cb) cb(node)
  })

  var toString = string.toString.bind(string)
  string.toString = function (opts) {
    var src = toString()
    if (opts && opts.map) {
      src += '\n' + convertSourceMap.fromObject(getSourceMap()).toComment() + '\n'
    }
    return src
  }
  string.inspect = toString
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
    if (node.edit === undefined) {
      addHelpers(node)
    }

    var keys = Object.keys(node)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      if (key === 'parent' || key === 'edit') continue
      if (node[key] && typeof node[key].type === 'string') {
        walk(node[key], node, cb)
      } else if (Array.isArray(node[key])) {
        walkArray(node[key], node, cb)
      }
    }

    cb(node)
  }
  function walkArray(array, parent, cb) {
    for (var i = 0; i < array.length; i++) {
      var child = array[i]
      if (child && typeof child.type === 'string') {
        walk(child, parent, cb)
      }
    }
  }

  function addHelpers (node) {
    var edit = new Helpers(node, string)
    node.edit = edit
    node.getSource = edit.source.bind(edit)
    if (node.update === undefined) node.update = edit.update.bind(edit)
    if (node.source === undefined) node.source = edit.source.bind(edit)
    if (node.append === undefined) node.append = edit.append.bind(edit)
    if (node.prepend === undefined) node.prepend = edit.prepend.bind(edit)
  }
}

function Helpers (node, string) {
  this.node = node
  this.string = string
}
Helpers.prototype.source = function () {
  return this.string.slice(this.node.start, this.node.end)
}
Helpers.prototype.update = function (replacement) {
  this.string.overwrite(this.node.start, this.node.end, replacement)
  return this
}
Helpers.prototype.append = function (append) {
  this.string.appendLeft(this.node.end, append)
  return this
}
Helpers.prototype.prepend = function (prepend) {
  this.string.prependRight(this.node.start, prepend)
  return this
}
