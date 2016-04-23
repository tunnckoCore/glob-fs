'use strict'

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require)

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign

/**
 * Lazily required module dependencies
 */

require('async')
require('arr-map', 'arrayMap')
require('array-unique')
require('extend-shallow', 'extend')
require('graceful-fs', 'fs')
require('glob-parent')
require('is-glob')
require('is-dotdir')
require('is-dotfile')
require('is-match')
require('is-valid-glob')
require('readable-stream', 'stream')
require('to-absolute-glob')
require('vinyl', 'File')
require('use')

/**
 * Restore `require`
 */

require = fn // eslint-disable-line no-undef, no-native-reassign

utils.isValidSince = function isValidSince (since) {
  return typeof since === 'number' || since instanceof Number || since instanceof Date
}

utils.arrayify = function arrayify (val) {
  if (!val) return []
  if (!Array.isArray(val)) return [val]
  return val
}

utils.arrayNegatives = function arrayNegatives (patterns, negatives) {
  var res = []
  var len = patterns.length
  var i = 0

  while (i < len) {
    if (patterns[i] && patterns[i][0] === '!') negatives.push(patterns[i].slice(1))
    else res.push(patterns[i])
    i++
  }
  return res
}

utils.toAbsolutePath = function toAbsolutePath (val, opts) {
  val = utils.arrayify(val)
  var len = val.length
  var i = 0

  while (i < len) {
    if (val[i]) {
      val[i] = utils.toAbsoluteGlob(val[i], opts)
      i++
    }
  }
  return val
}

utils.factory = function factory (type) {
  return function exclude (patterns, options) {
    this.options = utils.extend(this.options, options)
    this.isMatch = utils.isMatch(utils.toAbsolutePath(patterns), options)
    this.use(function (app) {
      return function (file) {
        if (app.isMatch(file.filepath)) {
          file[type] = true
          app.emit(type, file)
        }
      }
    })
    return this
  }
}

utils.plugins = {}
utils.plugins.installHack = function installHack (app) {
  return function (file) {
    var fp = file.path
    fp = fp.charAt(-1) === '/' ? fp.slice(0, -1) : fp
    file.filepath = file.stat.isDirectory() ? fp + '/' : file.path
  }
}

utils.plugins.basics = function basics (app) {
  var negatives = []

  app.queue = []
  app.patterns = utils.toAbsolutePath(app.patterns, app.options)
  app.patterns = utils.arrayNegatives(app.patterns, negatives)
  app.patterns = utils.arrayUnique(app.patterns)
  negatives = negatives.length > 1
    ? utils.toAbsolutePath(negatives, app.options)
    : negatives.length
      ? [utils.toAbsoluteGlob(negatives[0])]
      : []

  app.options.ignore = negatives.length >= 1 ? negatives : false
  app.bases = utils.arrayMap(app.patterns, utils.globParent)
}

utils.plugins.normalizeDots = function normalizeDots (app) {
  return function (file) {
    if (!app.options.dot && file.isDot()) {
      file.exclude = true
    }
    return file
  }
}

utils.plugins.match = function matchPlugin (app) {
  var isMatch = utils.isMatch(app.patterns, app.options)
  return function (file) {
    if (!file.exclude && !isMatch(file.filepath)) file.exclude = true
  }
}

/**
 * Expose `utils` modules
 */

module.exports = utils
