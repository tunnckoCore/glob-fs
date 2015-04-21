/**
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2015 Charlike Mike Reagent, contributors.
 * Released under the MIT license.
 */

'use strict';

var File = require('vinyl');
var micromatch = require('is-match');
var eachAsync = require('each-async');
var uniqueify = require('uniqueify');
var stripBom = require('strip-bom');
var debug = require('debug')('glob-fs');

var fs = require('graceful-fs');
var path = require('path');
var inherits = require('util').inherits;
var Readable = require('stream').Readable;

function GlobFS(root, options) {
  if (!(this instanceof GlobFS)) {
    return new GlobFS(root, options);
  }
  if (typeof root !== 'string') {
    throw new TypeError('[erasm-stream] expect `root` to be string');
  }
  Readable.call(this, {objectMode: true});

  options = typeof options === 'object' ? options : {};
  options.cwd = typeof options.cwd !== 'string' ? process.cwd() : options.cwd;

  if (typeof options.cwdbase === 'boolean' && options.cwdbase) {
    options.base = options.cwd;
  }

  this.options = options;

  var cwd = this.options.cwd;
  var patterns = this.options.patterns;

  this.root = unrelative(cwd, root);
  this.queue = [this.root];

  this.matches = 0;
  this.single = false;


  if (Array.isArray(patterns)) {
    this.single = patterns.length === 1;
    patterns = this.single ? unrelative(cwd, patterns[0]) : uniqueify(patterns);
    patterns = this.single ? patterns : patterns.map(function(pattern) {
      return unrelative(cwd, pattern);
    });
    patterns = patterns.concat(this.root);
    this.patterns = patterns;
    this.isMatch = micromatch(patterns, this.options);
    return;
  }

  /* uncomment when ok
  if (typeof patterns === 'string') {
    this.single = true;
    patterns = unrelative(cwd, patterns);
    this.isMatch = micromatch(patterns, options);
    return;
  }*/

  this.isMatch = micromatch(patterns, this.options);
};

inherits(GlobFS, Readable);

GlobFS.prototype._read = function __read() {
  var self = this;

  if (!this.queue.length) {
    debug('(end) matches: %s', this.matches);
    this.push(null);
    return;
  }

  var filepath = this.queue.shift();

  if (!this.isMatch(filepath)) {
    debug('(info) not match, %s', filepath);
    this._read();
    return;
  }

  // @todo
  if (/node_modules|\.git/.test(filepath)) {
    this._read();
    return;
  }
  this.matches++;

  debug('(stat) %s', filepath);
  fs.stat(filepath, function(err, stat) {
    if (err) {return self._error(err);}

    if (self.options.since > stat.mtime) {
      debug('(info) have not been modified since `options.since`');
      self._read();
      return;
    }

    var vinyl = new File({
      path: filepath,
      stat: stat,
      base: self.options.base || path.dirname(filepath),
      cwd: self.options.cwd
    });

    // @todo
    if (self.options.src) {
      debug('(info) `options.src` is enabled', filepath);
      if (stat.isFile()) {
        vinyl.contents = stripBom(fs.readFileSync(vinyl.path, 'utf8'));
      }
      if (vinyl.isStream()) {
        vinyl.contents = fs.createReadStream(vinyl.path).pipe(stripBom.stream());
      }
    }
    if (stat.isDirectory()) {
      self._readdir(filepath, function(err) {
        if (err) {return self._error(err);}
        self._push(vinyl);
      });
      return;
    }
    self._push(vinyl);
  });
};

/**
 * helpers for `error`, `push` and recursive `readdir`
 */
GlobFS.prototype._error = function _error(err) {
  debug('(error) %s', err.message);
  this.emit('error', err);
};

GlobFS.prototype._push = function _push(obj) {
  if (this.root === obj.path) {
    debug('(info) the root');
    this._read();
    return;
  }
  debug('(push) %s', obj.path);
  this.push(obj);
};

GlobFS.prototype._readdir = function _readdir(dir, done) {
  var self = this;
  debug('(readdir) %s', dir);
  fs.readdir(dir, function(err, filepaths) {
    if (err) {return self._error(err);}

    eachAsync(filepaths, function _eachFilepaths(fp, i, next) {
      fp = unrelative(dir, fp);
      debug('(queue) %s', fp);
      self.queue.push(fp);

      next();
    }, done);
  });
};

/**
 * utils
 */

function arrayify(val) {
  return !Array.isArray(val)
    ? [val]
    : val;
};

function unrelative(cwd, glob) {
  var negate = '';
  var ch = glob.charAt(0);
  if (ch === '!') {
    negate = ch;
    glob = glob.slice(1);
  }
  return negate + path.resolve(cwd, glob);
}

module.exports = GlobFS;
