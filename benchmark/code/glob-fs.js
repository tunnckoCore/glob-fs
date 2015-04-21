'use strict';

var gfs = require('../../index');
var path = require('path');
var assert = require('assert');
var cwd = path.join(__dirname, '../');

var gfsPatterns = [
  '!playing/b/{d,e}*.*',
  'playing/**/*',
  '!playing/a/{d..z}{0..9}.*',
  '!playing/**/*.(md|txt|json|hbs)',
];
var gfsOptions = {cwd: cwd, dot: true, src: true, patterns: gfsPatterns};

// module.exports = function _gfs(id, done) {
//   var files = [];
//   var stream = gfs(path.join(cwd, 'playing'), gfsOptions)

//   stream
//   .on('data', function(file) {
//     file.id = id || 0;
//     file.id = file.id + 1;
//     files.push(file);
//   })
//   // .on('error', done)
//   .on('end', function() {
//     assert(files[12].id === 124);
//     assert(typeof done === 'function');
//     done(null, true);
//   })
// };

var isMissing = require('is-missing');

module.exports = function _missing(id, done) {
  isMissing('assert-kindof', function _cb(err, res) {
    assert.strictEqual(err, null);
    assert.strictEqual(res, false);
    done();
  });
};
