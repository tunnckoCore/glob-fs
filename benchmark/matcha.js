'use strict';

var i = 0;
var gs = require('glob-stream');
var gfs = require('../index');
var path = require('path');

var gsPatterns = [
  'playing/**/*',
  '!playing/a/[d-z][0-9].*',
  '!playing/b/{d,e}*.*',
  '!playing/**/*.{md,txt,json,hbs}'
];
var gsOptions = {cwd: __dirname, dot: true};

var gfsPatterns = [
  '!playing/b/{d,e}*.*',
  'playing/**/*',
  '!playing/a/{d..z}{0..9}.*',
  '!playing/**/*.(md|txt|json|hbs)',
];
var gfsOptions = {cwd: __dirname, dot: true, src: true, patterns: gfsPatterns};

suite('glob-stream vs glob-fs', function() {
  bench('glob-stream', function(done) {
    gs.create(gsPatterns, gsOptions)
    .on('data', function(file) {
      i++;
    })
    .on('end', done);
  });
  bench('glob-fs', function(done) {
    gfs(path.join(__dirname, 'playing'), gfsOptions)
    .on('data', function(file) {
      i++;
    })
    .on('end', done);
  });
});
