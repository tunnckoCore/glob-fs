/*!
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

/* eslint-disable */

var utils = require('./utils')
var util = require('util')
var path = require('path')
// @todo try `match-file`
function Readdir (dir, options) {
  if (!(this instanceof Readdir)) {
    return new Readdir(dir, options)
  }
  if (typeof dir !== 'string') {
    throw new TypeError('readdir: expect a `dir` be string')
  }

  this.defaultOptions(options)
  this.initReaddir(dir)
  utils.use(this)
}

util.inherits(Readdir, utils.stream.Readable)

/**
 * [defaultOptions description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */

Readdir.prototype.defaultOptions = function defaultOptions (options) {
  this.options = utils.extend({
    objectMode: true,
    cwd: process.cwd()
  }, options)

  var since = this.options.since
  this.options.since = utils.isValidSince(since) ? +since : 0

  return this.options
}

Readdir.prototype.initReaddir = function initReaddir (dir) {
  utils.stream.Readable.call(this, this.options)
  this.path = path.resolve(this.options.cwd, dir)
  this.queue = [this.path]
}

/**
 * [_read description]
 * @return {[type]} [description]
 */

Readdir.prototype._read = function read () {
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

Readdir.prototype._stat = function stat (fp) {
  utils.fs.stat(fp, function (err, stats) {
    if (err) return this.emit('error', err)
    if (this.options.since > stats.mtime) {
      this._read()
      return
    }


    this.file = this.createFile(fp, stats)
    // @todo: run plugin stack from here

    var recurse = this.path === this.file.path || this.options.recursive
    if (recurse && stats.isDirectory()) {
      this._readdir(fp, function (err) {
        if (err) return this.emit('error', err)
        this._push()
      }.bind(this))
      return
    }
    this._push()
  }.bind(this))
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
      // @todo: check is it working if isMatch is here
      fp = path.resolve(dir, fp)
      self.queue.push(fp)
      next()
    }, done)
  })
}

Readdir.prototype._push = function push () {
  this.run(this.file)

  if (this.file.exclude) {
    return this.file.include
      ? this.push(this.file)
      : this._read()
  }

  this.push(this.file)
}

module.exports = Readdir
