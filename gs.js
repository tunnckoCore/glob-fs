'use strict'

/* eslint-disable */

var extend = require('extend-shallow')
var readdir = require('./index')
var matcher = require('is-match')
var findBase = require('glob-base')
var toAbsolute = require('to-absolute-glob')
var isValidGlob = require('is-valid-glob')
var arrayMap = require('arr-map')
var arrayUnique = require('array-unique')

function create (patterns, options) {
  if (!isValidGlob(patterns)) {
    throw new TypeError('glob-stream.create: expect `patterns` to be string or array of strings')
  }
  if (patterns.length === 0) {
    throw new Error('glob-stream.create: expect at least 1 pattern to be passed')
  }

  var negatives = []
  patterns = arrayify(patterns)
  patterns = arrayNegatives(patterns, negatives)
  patterns = arrayUnique(patterns)
  options = extend({
    ignore: negatives.length >= 1 ? negatives : false
  }, options)

  if (patterns.length === 1) {
    return createStream(patterns[0], options)
  }

  var len = patterns.length
  var i = 1
  var stream = createStream(patterns[0], options)

  while (i < len) {
    var src = createStream(patterns[i++], options)
    stream.use = src.use.bind(stream)
    src
      .on('data', function (file) { stream.emit('data', file) })
      .once('error', function (err) { stream.emit('error', err) })
  }
  return stream
}

function arrayify (val) {
  if (!val) return []
  if (!Array.isArray(val)) return [val]
  return val
}

function arrayNegatives (patterns, negatives) {
  return arrayMap(patterns, function toNegatives (pattern, i) {
    if (pattern[0] === '!') {
      negatives.push(pattern.slice(1))
      return patterns[i - 1]
    }
    return pattern
  })
}

function createStream (pattern, options) {
  options = extend({ recursive: false }, options)
  options.ignore = toAbsolutePath(options.ignore)

  var input = findBase(pattern)
  var basedir = input.isGlob ? input.base : pattern
  var stream = readdir(basedir, options)
  var isMatch = matcher(toAbsolutePath(pattern), options)
  var include = options.include
    ? matcher(toAbsolutePath(options.include), options)
    : function defaultIncludes () {}

  stream.use(function (app) {
    return function (file) {
      if (!options.dot && file.isDot()) file.exclude = true
      if (!file.exclude && !isMatch(file.path)) file.exclude = true
      if (include(file.path)) file.include = true
    }
  })
  return stream
}

function toAbsolutePath (val) {
  val = arrayify(val)
  var len = val.length
  var i = 0

  while (i < len) {
    if (val[i]) {
      val[i] = toAbsolute(val[i])
      i++
    }
  }
  return val
}

module.exports = create
module.exports.create = create
module.exports.createStream = createStream
