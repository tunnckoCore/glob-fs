/**
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2015 Charlike Mike Reagent, contributors.
 * Released under the MIT license.
 */

'use strict';

var File = require('vinyl');
var matcher = require('is-match');
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

  this.single = false;
  this.root = root;
  this.queue = [root];
  this.options = options;

  var cwd = this.options.cwd;
  var patterns = this.options.patterns;

  if (Array.isArray(patterns)) {
    this.single = patterns.length === 1;
    patterns = this.single ? unrelative(cwd, patterns[0]) : uniqueify(patterns);
    patterns = this.single ? patterns : patterns.map(function(pattern) {
      return unrelative(cwd, pattern);
    });
    patterns = patterns.concat(unrelative(cwd, 'node_modules'));
    this.isMatch = matcher(patterns, options);
    return;
  }
  if (typeof patterns === 'string') {
    this.single = true;
    patterns = unrelative(cwd, patterns);
    patterns = [patterns].concat(unrelative(cwd, 'node_modules'));
    this.isMatch = matcher(patterns, options);
    return;
  }
  this.isMatch = matcher(this.options.patterns, options);
};

inherits(GlobFS, Readable);

GlobFS.prototype.getCache = function() {
  return this.cache;
};
GlobFS.prototype._read = function __read() {
  var self = this;

  if (!self.queue.length) {
    debug('(end)');
    this.push(null);
    return;
  }

  var filepath = self.queue.shift();
  debug('(stat) %s', filepath);
  fs.stat(filepath, function(err, stat) {
    if (err) {return error(err);}

    var vinyl = new File({
      path: filepath,
      stat: stat,
      base: self.options.base || path.dirname(filepath),
      cwd: self.options.cwd
    });

    if (self.options.src) {
      if (stat.isFile()) {
        vinyl.contents = stripBom(fs.readFileSync(vinyl.path), 'utf8');
      }
      if (vinyl.isStream()) {
        vinyl.contents = fs.createReadStream(vinyl.path).pipe(stripBom.stream());
      }
    }

    if (stat.isDirectory()) {
      readdir(filepath, function(err) {
        if (err) {return error(err);}
        push(vinyl);
      });
      return;
    }
    push(vinyl);
  });


  /**
   * helpers for `error`, `push` and recursive `readdir`
   */
  function error(err) {
    debug('(error) %s', err.message);
    self.emit('error', err);
  }

  function push(obj) {
    var match = self.isMatch(obj.path);

    if (self.options.allowEmpty !== true && !match && self.single) {
      self.emit('error', new Error('File not found with singular glob'));
      return;
    }
    var since = match && (self.options.since < obj.stat.mtime);

    if (match || since) {
      debug('(push) %s', obj.path);
      self.push(obj);
      return;
    }

    self._read();
  }

  function readdir(dir, done) {
    debug('(readdir) %s', dir);
    fs.readdir(dir, function(err, filepaths) {
      if (err) {return error(err);}

      eachAsync(filepaths, function _eachFilepaths(fp, i, next) {
        fp = path.join(dir, fp);
        debug('(queue) %s', fp);
        self.queue.push(fp);

        next();
      }, done);
    });
  }
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
