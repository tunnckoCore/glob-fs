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
require('extend-shallow', 'extend')
require('graceful-fs', 'fs')
require('is-dotdir')
require('is-dotfile')
require('readable-stream', 'stream')
require('vinyl', 'File')
require('use')

/**
 * Restore `require`
 */

require = fn // eslint-disable-line no-undef, no-native-reassign

utils.isValidSince = function isValidSince (since) {
  return typeof since === 'number' || since instanceof Number || since instanceof Date
}

/**
 * Expose `utils` modules
 */

module.exports = utils
