'use strict';

var Suite = require('benchmarked');
var suite = new Suite({
  fixtures: 'fixtures/*.js',
  add: 'code/*.js',
  cwd: __dirname,
  async: true,
  defer: true
});

suite.run();
