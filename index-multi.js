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

function Readdir (patterns, options) {
  if (!(this instanceof Readdir)) {
    return new Readdir(patterns, options)
  }
  if (!utils.isValidGlob(patterns)) {
    throw new TypeError('readdir: expect `patterns` to be string or array of strings')
  }
  if (patterns.length === 0) {
    throw new Error('readdir: expect at least 1 pattern to be passed')
  }

  utils.use(this)
  this.defaultOptions(options)
  this.initReaddir(patterns)
}

util.inherits(Readdir, utils.stream.Readable)

/**
 * [defaultOptions description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */

Readdir.prototype.defaultOptions = function defaultOptions (options) {
  this.options = utils.extend({
    recurse: false,
    objectMode: true,
    cwd: process.cwd()
  }, options)

  var since = this.options.since
  this.options.since = utils.isValidSince(since) ? +since : 0

  return this.options
}

Readdir.prototype.initReaddir = function initReaddir (patterns) {
  utils.stream.Readable.call(this, this.options)
  this.patterns = patterns
  this
    .use(utils.plugins.basics)
    .use(utils.plugins.installHack)
    .use(utils.plugins.normalizeDots)
    .use(utils.plugins.match)
    // .use(function (app) {
    //   app.include = utils.factory('include')
    //   app.exclude = utils.factory('exclude')
    // })
    // .include(this.patterns)
}

/**
 * [_read description]
 * @return {[type]} [description]
 */

Readdir.prototype._read = function read () {
  if (!this.bases.length && !this.queue.length) {
    this.push(null)
    return
  }
  if (!this.queue.length) {
    this.queue = [this.bases.shift()]
  }
  this._stat(this.queue.shift())
}

/**
 * [_stat description]
 * @param  {[type]} fp [description]
 * @return {[type]}    [description]
 */

Readdir.prototype._stat = function stat (fp) {
  var self = this
  utils.fs.stat(fp, function (err, stats) {
    if (err) return self.emit('error', err)
    self.file = self.createFile(fp, stats)

    if (self.options.since > stats.mtime) {
      self.emit('since', self.file)
      self._read()
      return
    }

    self.run(self.file)

    var recurse = self.path === self.file.path
    recurse = recurse || self.options.recurse || self.options.recursive

    if (recurse && stats.isDirectory()) {
      self.emit('dir', self.file)
      self._readdir(fp, self.next.bind(self))
      return
    }
    self.emit('file', self.file)
    self.next()
  })
}

Readdir.prototype.createFile = function (fp, stats) {
  this.file = new utils.File({
    cwd: this.options.cwd,
    path: fp,
    stat: stats
  })
  this.file.isDotfile = function isDotfile () {
    return utils.isDotfile(this.path)
  }
  this.file.isDotdir = function isDotdir () {
    return utils.isDotdir(this.path)
  }
  this.file.isDot = function isDot () {
    return this.isDotfile() || this.isDotdir()
  }
  return this.file
}

/**
 * [_readdir description]
 * @param  {[type]}   dir  [description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */

Readdir.prototype._readdir = function readdir (dir, done) {
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

Readdir.prototype.next = function next (err) {
  if (err) return this.emit('error', err)
  if (this.file.exclude) {
    return this.file.include
      ? this.push(this.file)
      : this._read()
  }
  this.push(this.file)
}

module.exports = Readdir
