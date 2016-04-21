/*!
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var utils = require('./utils')
var util = require('util')
var path = require('path')

function GlobFS (pattern, options) {
  if (!(this instanceof GlobFS)) {
    return new GlobFS(pattern, options)
  }
  if (typeof pattern !== 'string') {
    throw new TypeError('glob-fs: expect `pattern` be string')
  }

  this.initGlob(pattern, options)
  utils.stream.Readable.call(this, this.options)
}

util.inherits(GlobFS, utils.stream.Readable)

/**
 * [initGlob description]
 * @param  {[type]} pattern [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */

GlobFS.prototype.initGlob = function initGlob (pattern, options) {
  this.pattern = pattern
  this.input = utils.globBase(this.pattern)
  this.options = utils.extend({
    objectMode: true,
    cwd: process.cwd(),
    cwdbase: false,
    base: null
  }, options)

  if (this.options.cwdbase === true) {
    this.options.base = this.options.cwd
  }

  var fp = this.input.isGlob ? this.input.base : this.pattern
  pattern = this.input.isGlob ? this.pattern : this.input.base
  pattern = path.resolve(this.options.cwd, pattern)

  this.path = path.resolve(this.options.cwd, fp)
  this.queue = [this.path]

  var include = this.options.include
  var exclude = this.options.exclude

  this.isMatch = utils.mm(pattern, this.options)
  this.isIncluded = include ? utils.mm(include, this.options) : function noop () {}
  this.isExcluded = exclude ? utils.mm(exclude, this.options) : function noop () {}
}

/**
 * [_read description]
 * @return {[type]} [description]
 */

GlobFS.prototype._read = function read () {
  if (!this.queue.length) {
    this.push(null)
    return
  }
  this._stat(this.queue.shift())
}

/**
 * [_stat description]
 * @param  {[type]} fp [description]
 * @return {[type]}    [description]
 */

GlobFS.prototype._stat = function stat (fp) {
  var self = this
  utils.fs.stat(fp, function (err, stats) {
    if (err) return self.emit('error', err)
    if (self.options.since > stats.mtime) {
      self._read()
      return
    }
    var file = self.createFile(fp, stats)

    if (stats.isDirectory()) {
      self._readdir(fp, function (err, res) {
        if (err) return self.emit('error', err)
        self._push(file)
      })
      return
    }
    self._push(file)
  })
}

/**
 * [createFile description]
 * @param  {[type]} fp    [description]
 * @param  {[type]} stats [description]
 * @return {[type]}       [description]
 */

GlobFS.prototype.createFile = function createFile (fp, stats) {
  return new utils.File({
    path: fp,
    stat: stats,
    base: this.options.base || path.dirname(fp),
    cwd: this.options.cwd
  })
}

/**
 * [_readdir description]
 * @param  {[type]}   dir  [description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */

GlobFS.prototype._readdir = function readdir (dir, done) {
  var self = this
  utils.fs.readdir(dir, function (err, filepaths) {
    if (err) return done(err)
    utils.async.eachSeries(filepaths, function (fp, next) {
      fp = path.resolve(dir, fp)
      self.queue.push(fp)
      next()
    }, done)
  })
}

/**
 * [_push description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */

GlobFS.prototype._push = function push (file) {
  var included = this.isIncluded(file.path)
  var excluded = this.isExcluded(file.path)

  if (/node_modules|\.git/.test(file.path)) {
    return this._read()
  }
  if (this.isMatch(file.path) || included) {
    if (excluded) return included ? this.push(file) : this._read()
    this.push(file)
    return
  }
  this._read()
}

module.exports = GlobFS
