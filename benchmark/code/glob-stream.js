'use strict';

var gs = require('glob-stream');
var path = require('path');

var cwd = path.join(__dirname, '../');

var gsPatterns = [
  'playing/**/*',
  '!playing/a/[d-z][0-9].*',
  '!playing/b/{d,e}*.*',
  '!playing/**/*.{md,txt,json,hbs}'
];
var gsOptions = {cwd: cwd, dot: true};

module.exports = function _gs(id, done) {
  var files = [];
  var stream = gs.create(gsPatterns, gsOptions);

  stream
  .on('data', function(file) {
    file.id = id || 0;
    file.id = file.id + 1;
    files.push(file);
  })
  .on('error', done)
  .on('end', function() {
    assert(files[12].id === 124);
    assert(typeof done === 'function');
    done();
  })
};
