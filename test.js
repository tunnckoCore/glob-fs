/**
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2015 Charlike Mike Reagent, contributors.
 * Released under the MIT license.
 */

'use strict';

var assert = require('assert');
var path = require('path');
var test = require('assertit');
var gfs = require('./index');
var vfs = require('vinyl-fs');
var gs = require('glob-stream');

var globStreamPatterns = [
  'playing/**/*',
  '!playing/a/[d-z][0-9].*',
  '!playing/b/{d,e}*.*',
  '!playing/**/*.{md,txt,json,hbs}'
];

var globFsPatterns = [
  '!playing/b/{d,e}*.*',
  'playing/**/*',
  '!playing/a/{d..z}{0..9}.*',
  '!playing/**/*.(md|txt|json|hbs)',
];

var i = 0;

// gs.create(globStreamPatterns, {cwd: __dirname, dot: true})
// .on('data', function(file) {
//   i++;
//   console.log(i, file.path)
// })
// .on('end', function() {
//   console.log('glob-stream:', i);
// });



gfs(path.join(__dirname, 'playing'), {cwd: __dirname, dot: true, src: true, patterns: globFsPatterns})
.on('data', function(file) {
  i++;
  console.log(i, file.contents)
})
.on('end', function() {
  console.log('glob-fs:', i);
});
